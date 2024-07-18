# Copyright (c) 2024, phamos.eu and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

class DATEVExportLog(Document):
	def validate(self):
		self.exported_on =  now_datetime().strftime("%d-%m-%Y %H:%M:%S")
