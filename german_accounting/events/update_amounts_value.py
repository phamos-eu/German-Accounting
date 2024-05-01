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
        AND outstanding_amount != 0
    """
        
    result = frappe.db.sql(sql_query, {"customer": customer})
    
    if result:
        outstanding_amount = result[0][0]
        if outstanding_amount:
            total_outstanding_amount = outstanding_amount

    doc.open_invoice_amount = total_outstanding_amount

def update_overdue_invoice_amount(doc):
    pass

def update_non_invoiced_amount(doc):
    customer = doc.name
    total_non_invoiced_amount = 0.0

    sql_query = """
        SELECT SUM(grand_total)
        FROM `tabSales Order`
        WHERE customer = %(customer)s
        AND status NOT IN ('Cancelled', 'Completed','On Hold', 'Closed');
    """
        
    result = frappe.db.sql(sql_query, {"customer": customer})
    
    if result:
        noninvoiced_amount = result[0][0]
        if noninvoiced_amount:
            total_non_invoiced_amount = noninvoiced_amount

    doc.non_invoiced_amount = total_non_invoiced_amount

def update_total(doc):
    pass


def update_amounts(doc, method=None):
    update_open_invoice_amount(doc)
    update_overdue_invoice_amount(doc)
    update_non_invoiced_amount(doc)
    update_total(doc)



