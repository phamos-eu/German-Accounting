# Copyright (c) 2019, Frappe and Contributors
# License: GNU General Public License v3. See license.txt


import frappe


def execute():

	if frappe.db.exists("DocType", "DATEV Export Mapping"):
		frappe.delete_doc("DocType", "DATEV Export Mapping", force=1)
		frappe.delete_doc("DocType", "DATEV Export Mapping Table", force=1)