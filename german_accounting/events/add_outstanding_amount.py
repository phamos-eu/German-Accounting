import frappe
from frappe import _


def add_outstanding_amount(doc, method=None):
    outstanding_amt_sum = 0.0

    customer = doc.customer
    outstanding_amount = doc.outstanding_amount
    if customer:
        open_invoice_amount = frappe.get_value("Customer", customer, "open_invoice_amount")
        outstanding_amt_sum = outstanding_amount + open_invoice_amount
        frappe.db.set_value("Customer", customer, "open_invoice_amount", outstanding_amt_sum)



