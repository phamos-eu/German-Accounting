import frappe
from frappe import _

def validate_grand_total(doc, method=None):
    if doc.grand_total == 0:
        frappe.throw(_("The grand total can't be zero."))