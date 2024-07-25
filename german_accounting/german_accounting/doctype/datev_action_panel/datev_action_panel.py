# Copyright (c) 2024, phamos.eu and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _
from frappe.utils import get_link_to_form, now_datetime
from datetime import date

class DATEVActionPanel(Document):
	pass


@frappe.whitelist()
def create_log(month, company, sales_invoices=[]):
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
		
	frappe.msgprint(_("A DATEV Export Log ")+ get_link_to_form("DATEV Export Log", log_doc.name) + _(" has been created for ")+ _(month) + _(" month containing a *.csv and *.pdf that can be downloaded"))
	return log_doc

