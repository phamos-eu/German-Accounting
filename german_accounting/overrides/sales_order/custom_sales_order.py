import frappe
from erpnext.selling.doctype.sales_order.sales_order import SalesOrder as OriginalSalesOrder

class CustomSalesOrder(OriginalSalesOrder):
    def check_credit_limit(self):
        pass