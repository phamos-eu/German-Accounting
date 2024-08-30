import io
import csv
import frappe
from frappe import _
from datetime import date
from frappe.utils.pdf import get_pdf
from frappe.utils.jinja_globals import bundled_asset
from frappe.utils import get_link_to_form, now_datetime
from german_accounting.german_accounting.report.datev_sales_invoice_export.datev_sales_invoice_export import get_data, get_columns


@frappe.whitelist()
def create_datev_export_logs(month, year):
	company = frappe.defaults.get_user_default("Company")
	if not company:
		frappe.throw(_("Please set the default company"))

	if not get_company_country(company) == "Germany":
		frappe.throw(_("Country in Default {} must be Germany").format(get_link_to_form("Company", company)))

	include_header_in_csv = frappe.get_cached_doc('German Accounting Settings').include_header_in_csv

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
		frappe.throw(_("Sales invoices for this configuration have already been exported!"))

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
		frappe.throw(_("Sales invoices for this configuration have already been exported!"))

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
		frappe.throw(_("Sales invoices for this configuration have already been exported!"))

	field = "debtors_csv"
	filename = datev_export_log_name + "-debtors.csv"
	columns_for_debtors_csv = get_columns({"export_type": "Debtors CSV"})
	create_and_upload_csv(debtors_csv_rows, columns_for_debtors_csv, datev_export_log_name, field, filename)

	frappe.msgprint(
		_("A DATEV Export Log {0} has been created for {1} month containing a *.csv and *.pdf that can be downloaded").format(
			get_link_to_form("DATEV Export Log", datev_export_log_name),
			month,
		),
	)


def create_and_upload_csv(csv_rows, csv_columns, datev_export_log_name, field, filename, include_header_in_csv=True):
	csv_str = io.StringIO()
	writer = csv.writer(csv_str, delimiter=";", quotechar="'", quoting=csv.QUOTE_MINIMAL)

	if include_header_in_csv:
		field_mapping_table = [column.get("custom_header") for column in csv_columns]
		field_mapping_table.append("")
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
		csv_row.append("")
		writer.writerow(csv_row)

	csv_str.seek(0)
	content = csv_str.getvalue().rstrip()
	dt, dn = "DATEV Export Log", datev_export_log_name
	file = save_file(filename, content, dt, dn)
	frappe.db.set_value(dt, dn, field, file.file_url)


def create_and_upload_pdf(month, pdf_columns, pdf_rows, datev_export_log_name, field):
	content = frappe.render_template("german_accounting/german_accounting/page/datev_action_panel/datev_sales_invoice_export/datev_sales_invoice_export.html", {
		"title": frappe._("DATEV Sales Invoice"),
		"subtitle": "filters_html",
		"filters": {
			"month": month
		},
		"data": pdf_rows
	})

	print_bundle_css = bundled_asset("print.bundle.css")
	print_css = frappe.www.printview.get_print_style(frappe.db.get_singles_dict("Print Settings").print_style or "Redesign", for_legacy=True)
	html = frappe.render_template("german_accounting/german_accounting/page/datev_action_panel/datev_sales_invoice_export/print_template.html", {
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

	pdf_content = get_pdf(html, {"orientation": "Landscape"})
	filename = f"{datev_export_log_name}-sales-invoice.pdf"
	dt, dn = "DATEV Export Log", datev_export_log_name
	file_doc = save_file(filename, pdf_content, dt, dn)
	frappe.db.set_value(dt, dn, field, file_doc.file_url)


def create_log(month, company, sales_invoices):
	exported_on = now_datetime().strftime("%d-%m-%Y %H:%M:%S")
	log_doc = frappe.new_doc("DATEV Export Log")
	log_doc.update({
		"month": month,
		"company": company,
		"exported_on": exported_on,
		"year": str(date.today().year)
	})
	log_doc.save()
	
	# update exported on in SI
	for si in sales_invoices:
		frappe.db.set_value("Sales Invoice", si, "custom_exported_on", exported_on)
		
	return log_doc


@frappe.whitelist()
def get_company_country(company_name):
    return {
		"country": frappe.get_cached_value("Company", company_name, "country")
    }


def save_file(file_name, content, attached_to_doctype, attached_to_name):
	file_doc = frappe.new_doc("File")
	file_doc.file_name = file_name
	file_doc.attached_to_doctype = attached_to_doctype, 
	file_doc.attached_to_name = attached_to_name
	file_doc.content = content
	file_doc.folder="Home/Attachments", 
	file_doc.is_private = 1
	file_doc.insert(ignore_permissions=True)

	return file_doc
