// Copyright (c) 2024, phamos.eu and contributors
// For license information, please see license.txt

frappe.ui.form.on('DATEV OPOS Import', {
	refresh: function(frm) {
		if (frm.doc.import_file) {
			frm.add_custom_button(__("Start Import"), () => {
				// frm.call("start_import", {
				// 	file_url: frm.doc.import_file,
				// 	bank_account: frm.doc.bank_account,
				// 	company: frm.doc.company,
				// });
			});
		}
	}
});
