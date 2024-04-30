import frappe
from frappe import _

def update_open_invoice_amount(doc):

    customer = doc.name
    total_outstanding_amount = 0.0

    sql_query = """
        SELECT SUM(outstanding_amount)
        FROM `tabSales Invoice`
        WHERE customer = %(customer)s
        AND docstatus = 1
        AND outstanding_amount > 0
    """
        
    result = frappe.db.sql(sql_query, {"customer": customer})
    
    if result:
        outstanding_amount = result[0][0]
        if outstanding_amount:
            total_outstanding_amount = outstanding_amount

    doc.open_invoice_amount = total_outstanding_amount


def update_amounts(doc, method=None):
    update_open_invoice_amount(doc)




