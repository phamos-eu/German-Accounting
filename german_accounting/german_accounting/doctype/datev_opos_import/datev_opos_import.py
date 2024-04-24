# Copyright (c) 2024, phamos.eu and contributors
# For license information, please see license.txt

import frappe
from frappe.utils.file_manager import get_file_path
from frappe.model.document import Document
import os
import csv
import chardet
from frappe import _

class DATEVOPOSImport(Document):
	@frappe.whitelist()
	def start_import(self, file_url):
		file_path = self.get_file_from_url(file_url)
		# frappe.msgprint('file path', file_path)

		# Detect encoding
		with open(file_path, 'rb') as f:
			rawdata = f.read()
			result = chardet.detect(rawdata)
			encoding = result['encoding']

		# frappe.msgprint('encoding', encoding)
		total_rows = sum(1 for _ in open(file_path, mode='r', encoding=encoding))
		csv_data = []
		with open(file_path, mode='r', encoding=encoding, errors='replace') as csvfile:
			csv_reader = csv.reader(csvfile)
			frappe.publish_progress(0, title='Importing', description='Starting import...')
		
			if encoding=='utf-8' or encoding=='ascii':
				# print('encoding is', encoding)
				for index, row in enumerate(csv_reader):
					# print(index, row)
					csv_data.append(row)

					index+=1
					progress = int((index / total_rows) * 100)
					frappe.publish_progress(progress, title='Importing', description=f'Processing row {index}/{total_rows}')
				# print('the final csv data', csv_data)
				self.update_sales_invoice_status(csv_data)
			else:
				
				frappe.throw(_('{0} is unsupported file format. Only utf-8 and ascii format is supported currently.').format(encoding))


	def get_file_from_url(self, file_url):
		
		file_path = get_file_path(file_url.split('/')[-1])
		if not os.path.exists(file_path):
			frappe.throw(_('File not found: {0}').format(file_path))
		
		return file_path

	def update_sales_invoice_status(self, csv_data):
		csv_invoice_numbers = [row[1] for row in csv_data]
		
		# print('inside update_sales_invoice_status', csv_invoice_numbers)
		invoices = frappe.get_all("Sales Invoice", filters={
			"status": ["not in", ["Paid", "Cancelled", "Draft"]],
			"name": ["not in", csv_invoice_numbers]
			}, fields=["name"])
	
		# print('selected ones', invoices)
		for invoice in invoices:
			# print('the invoice names', invoice.name)
			frappe.db.set_value("Sales Invoice", invoice.name, "status", "Paid")

