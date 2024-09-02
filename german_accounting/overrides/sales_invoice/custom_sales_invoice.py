from erpnext.accounts.doctype.sales_invoice.sales_invoice import SalesInvoice as OriginalSalesInvoice

class CustomSalesInvoice(OriginalSalesInvoice):
	def check_credit_limit(self):
		pass