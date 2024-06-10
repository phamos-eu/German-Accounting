# Copyright (c) 2024, phamos.eu and contributors
# For license information, please see license.txt

import frappe
from frappe.utils.file_manager import get_file_path
from frappe.utils import today
from frappe.model.document import Document
import os
import csv
import chardet
from frappe import _

class DATEVOPOSImport(Document):
	@frappe.whitelist()
	def start_import(self, file_url):
		file_path = self.get_file_from_url(file_url)
		
		# Detect encoding
		with open(file_path, 'rb') as f:
			rawdata = f.read()
			result = chardet.detect(rawdata)
			encoding = result['encoding']


		total_rows = self.detect_actual_data_rows(file_path, encoding)
		csv_data = []

		with open(file_path, mode='r', encoding=encoding, errors='replace') as csvfile:
			
			csv_reader = csv.reader(csvfile)
			frappe.publish_progress(0, title='Importing', description='Starting import...')
			
			if encoding=='ascii':
				
				for index, row in enumerate(csv_reader):

					if index >= total_rows:
				 		break

					# row = ''.join(row)
					# row = row.split(';')
					
					csv_data.append(row)

					index+=1
					progress = int((index / total_rows) * 100)
					frappe.publish_progress(progress, title='Importing', description=f'Processing row {index}/{total_rows}')

				self.update_sales_invoice_status(csv_data)
			else:
				
				frappe.throw(_('{0} is unsupported file format. Only ascii format is supported currently.').format(encoding))


	def get_file_from_url(self, file_url):
		
		file_path = get_file_path(file_url.split('/')[-1])
		if not os.path.exists(file_path):
			frappe.throw(_('File not found: {0}').format(file_path))
		
		return file_path

	def detect_actual_data_rows(self, file_path, encoding):
		with open(file_path, mode='r', encoding=encoding, errors='replace') as csvfile:
			csv_reader = csv.reader(csvfile)
			actual_rows = 0
			for row in csv_reader:
				row = ''.join(row)
				row = row.split(';')
				empty_row = True
				for cell in row:
					if cell.strip():
						empty_row = False
						break  
				if not empty_row:
					actual_rows += 1
				
		return actual_rows

	def update_sales_invoice_status(self, csv_data):

		csv_invoice_numbers = [row[1] for row in csv_data]
		
		invoices = frappe.get_all("Sales Invoice", filters={
			"status": ["not in", ["Paid", "Cancelled", "Draft", "Credit Note Issued"]],
			"outstanding_amount": ["!=", 0],
			"name": ["not in", csv_invoice_numbers]
			}, fields=["name"])
        
		for invoice in invoices:
			payment_entry = frappe.call("erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry", 'Sales Invoice', invoice.name)
			payment_entry.reference_date = today()
			payment_entry.reference_no = 'DATEV OPOS import '+ today()

			payment_entry.insert()
			payment_entry.submit()