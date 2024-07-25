import frappe


def execute():
	"""Check Report and delete"""
	if frappe.db.exists("Report", "DATEV Sales Invoice"):
		frappe.delete_doc("Report", "DATEV Sales Invoice", force=1)