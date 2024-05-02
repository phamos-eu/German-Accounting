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
    customer = doc.name
    total_outstanding_amount = 0.0

    sql_query = """
        SELECT SUM(outstanding_amount)
        FROM `tabSales Invoice`
        WHERE customer = %(customer)s
        AND status='Overdue'
    """
        
    result = frappe.db.sql(sql_query, {"customer": customer})
    
    if result:
        outstanding_amount = result[0][0]
        if outstanding_amount:
            total_outstanding_amount = outstanding_amount

    doc.overdue_invoice_amount = total_outstanding_amount

def update_non_invoiced_amount(doc):
    pass
    customer = doc.name
    total_non_invoiced_amount = 0.0
    total_billed_amount = 0.0
    net_non_invoice_amount = 0.0

    sql_query = """
        SELECT SUM(base_grand_total)
        FROM `tabSales Order`
        WHERE customer = %(customer)s
        AND status NOT IN ('Cancelled', 'Completed','On Hold', 'Closed')
        AND per_billed != '100'
    """
        
    result = frappe.db.sql(sql_query, {"customer": customer})
    
    if result:
        noninvoiced_amount = result[0][0]
        if noninvoiced_amount:
            total_non_invoiced_amount = noninvoiced_amount

    sql_query2 = """
        SELECT SUM(billed_amt)
	    FROM `tabSales Order Item`
	    WHERE parent IN (
	        SELECT name
	        FROM `tabSales Order`
	        WHERE customer = %(customer)s
	        AND status NOT IN ('Cancelled', 'Completed', 'On Hold', 'Closed')
	        AND per_billed != '100'
	    )
    """
    result2 = frappe.db.sql(sql_query2, {"customer": customer})
    
    if result2:
        billed_amount = result2[0][0]
        if billed_amount:
            total_billed_amount = billed_amount

    net_non_invoice_amount = total_non_invoiced_amount - total_billed_amount

    doc.non_invoiced_amount = net_non_invoice_amount

def update_total(doc):
    pass


def update_amounts(doc, method=None):
    update_open_invoice_amount(doc)
    update_overdue_invoice_amount(doc)
    update_non_invoiced_amount(doc)
    update_total(doc)



