# Copyright (c) 2019, Frappe and Contributors
# License: GNU General Public License v3. See license.txt


import frappe


def execute():

	if frappe.db.exists("Workspace", "IMAT"):
		frappe.delete_doc("Workspace", "IMAT", force=1)