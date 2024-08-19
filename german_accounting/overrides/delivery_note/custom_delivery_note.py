import frappe
from erpnext.stock.doctype.delivery_note.delivery_note import DeliveryNote as OriginalDeliveryNote

class CustomDeliveryNote(OriginalDeliveryNote):
	def check_credit_limit(self):
		pass