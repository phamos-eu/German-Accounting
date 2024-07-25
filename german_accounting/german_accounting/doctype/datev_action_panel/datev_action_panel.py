# Copyright (c) 2024, phamos.eu and contributors
# For license information, please see license.txt

from frappe.model.document import Document
from german_accounting.german_accounting.report.datev_sales_invoice_export.datev_sales_invoice_export import get_data, get_columns
from frappe.utils.jinja_globals import bundled_asset, is_rtl
from frappe.utils import get_link_to_form, now_datetime
from frappe.utils.pdf import get_pdf
# from frappe.utils.print_format import report_to_pdf
from frappe.utils.file_manager import save_file
from frappe.desk.query_report import get_script
from datetime import date
from frappe import _
import frappe
import csv
import io

class DATEVActionPanel(Document):
	pass


@frappe.whitelist()
def create_datev_export_logs(month, year, company=None):

	include_header_in_csv= frappe.db.get_single_value("German Accounting Settings", "include_header_in_csv")

	datev_export_filters = frappe._dict({
		"month": month,
		"year": year,
		"company": company,
		"export_type": "Sales Invoice CSV",
		'unexported_sales_invoice': 1,
		"include_header_in_csv": include_header_in_csv
	})
	
	rows = get_data(datev_export_filters)
	if not len(rows):
		frappe.throw(_("No data found!"))

	sales_invoices = [row.get("invoice_no") for row in rows]

	datev_export_log = create_log(month, company, sales_invoices)

	datev_export_log_name = datev_export_log.name
	datev_exported_on = datev_export_log.exported_on

	field = "sales_invoice_csv"
	filename = datev_export_log_name + "-sales-invoice.csv"
	columns_for_sales_invoice_csv = get_columns({"export_type": "Sales Invoice CSV"})
	create_and_upload_csv(rows, columns_for_sales_invoice_csv, datev_export_log_name, field, filename, include_header_in_csv)

	rows_for_sales_invoice_pdf = get_data(frappe._dict({
		"month": month,
		"year": year,
		"company": company,
		"export_type": "Sales Invoice PDF",
		'unexported_sales_invoice': 0,
		'exported_on': datev_exported_on,
		"include_header_in_csv": include_header_in_csv,
	}))
	if not rows_for_sales_invoice_pdf:
		frappe.throw(_("No data found!"))

	columns_for_sales_invoice_pdf = get_columns({"export_type": "Sales Invoice PDF"})
	create_and_upload_pdf(month, columns_for_sales_invoice_pdf, rows_for_sales_invoice_pdf, datev_export_log_name, "sales_invoice_pdf")

	debtors_csv_rows = get_data(frappe._dict({
		"month": month,
		"year": year,
		"company": company,
		"export_type": "Debtors CSV",
		'unexported_sales_invoice': 0,
		'exported_on': datev_exported_on,
		"include_header_in_csv": include_header_in_csv,
	}))

	if not debtors_csv_rows:
		frappe.throw(_("No data found!"))

	field = "debtors_csv"
	filename = datev_export_log_name + "-debtors.csv"
	columns_for_debtors_csv = get_columns({"export_type": "Debtors CSV"})
	create_and_upload_csv(debtors_csv_rows, columns_for_debtors_csv, datev_export_log_name, field, filename)


def create_and_upload_csv(csv_rows, csv_columns, datev_export_log_name, field, filename, include_header_in_csv=True):
	csv_data = []
	csv_str = io.StringIO()
	writer = csv.writer(csv_str, delimiter=";", quotechar="'", quoting=csv.QUOTE_MINIMAL)

	if include_header_in_csv:
		field_mapping_table = [column.get("custom_header") for column in csv_columns]
		csv_data.append(field_mapping_table)
		writer.writerow(field_mapping_table)

	for row in csv_rows:
		csv_row = []
		for mapping in csv_columns:
			mapping_label = mapping.get("fieldname")
			one_col = mapping.get("one_col")
			if mapping_label and mapping_label in row:
				value = row[mapping_label]
				if mapping.get("is_quoted_in_csv"):

					csv_row.append(f'\"{value}\"')
				else:
					csv_row.append(value)
			else:
				csv_row.append("1" if one_col else "")
		csv_data.append(csv_row)
		writer.writerow(csv_row)

	csv_str.seek(0)

	file = save_file(filename, csv_str.getvalue(), "DATEV Export Log", datev_export_log_name, folder="Home/Attachments", is_private=1)
	frappe.db.set_value("DATEV Export Log", datev_export_log_name, field, file.file_url)

	return csv_str.getvalue()


def create_and_upload_pdf(month, pdf_columns, pdf_rows, datev_export_log_name, field):
	content = frappe.render_template("german_accounting/public/html/datev_sales_invoice_export.html", {
		"title": frappe._("DATEV Sales Invoice"),
		"subtitle": "filters_html",
		"filters": {
			"month": month
		},
		"data": pdf_rows
	})

	print_bundle_css = bundled_asset("print.bundle.css")
	print_css = frappe.www.printview.get_print_style(frappe.db.get_singles_dict("Print Settings").print_style or "Redesign", for_legacy=True)
	html = frappe.render_template("german_accounting/public/html/print_template.html", {
		"title": frappe._("DATEV Sales Invoice"),
		"content": content,
		"base_url": frappe.utils.get_url(),
		"print_bundle_css": print_bundle_css,
		"print_css": print_css,
		"print_settings": {},
		"landscape": False,
		"columns": pdf_columns,
		"lang": frappe.local.lang
	})

	pdf = get_pdf(html, {"orientation": "Landscape"})

	filename = f"{datev_export_log_name}-sales-invoice.pdf"
	file_doc = save_file(filename, pdf, "DATEV Export Log", datev_export_log_name, is_private=True)
	frappe.db.set_value("DATEV Export Log", datev_export_log_name, field, file_doc.file_url)


@frappe.whitelist()
def create_log(month, company=None, sales_invoices=[]):
	if sales_invoices and not isinstance(sales_invoices, list):
		sales_invoices = frappe.parse_json(sales_invoices)

	exported_on = now_datetime().strftime("%d-%m-%Y %H:%M:%S")
	log_doc = frappe.new_doc("DATEV Export Log")
	log_doc.update({
		"month": month,
		"company": company,
		"exported_on": exported_on,
		"year": str(date.today().year)
	})
	log_doc.save(ignore_permissions=True)
	
	# update exported on in SI
	for si in sales_invoices:
		frappe.db.set_value("Sales Invoice", si, "custom_exported_on", exported_on)
		
	frappe.msgprint(_("A DATEV Export Log "+get_link_to_form("DATEV Export Log", log_doc.name) + " has been created for "+ month +" month containing a *.csv and *.pdf that can be downloaded"))
	return log_doc

