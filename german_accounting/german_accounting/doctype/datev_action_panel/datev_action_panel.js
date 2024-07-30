// Copyright (c) 2024, phamos.eu and contributors
// For license information, please see license.txt

frappe.ui.form.on('DATEV Action Panel', {
	// Copyright (c) 2024, phamos.eu and contributors
	// For license information, please see license.txt
	onload: function (frm) {
		$('.page-actions').hide();
	},

	create_datev_export_logs: function(frm){
		frm.events.export_datev_logs(frm);
	},

	export_datev_logs: function(frm){
		let d = new frappe.ui.Dialog({
			title: __("Select Year, Month and Company"),
			fields: [
				{
					"fieldname": "year",
					"label": __("Year"),
					"fieldtype": "Data",
					"default": new Date().getFullYear(),
					"reqd": 1
				},
				{
					"fieldname": "month",
					"label": __("Month"),
					"fieldtype": "Select",
					"options": "\nJanuary\nFebruary\nMarch\nApril\nMay\nJune\nJuly\nAugust\nSeptember\nOctober\nNovember\nDecember",
					"default": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November",
						"December"
					][frappe.datetime.str_to_obj(frappe.datetime.get_today()).getMonth()],
					"reqd": 1
				},
				{
					"fieldname": "company",
					"label": __("Company"),
					"fieldtype": "Link",
					"options": "Company"
				}
			],
			primary_action: async function () {
				let data = d.get_values();
				frappe.call({
					method: "german_accounting.german_accounting.doctype.datev_action_panel.datev_action_panel.create_datev_export_logs",
					args: {
						"month": data.month,
						"year": data.year,
						"company": data.company,
					},
					callback: function (r) {

					},
				});
				d.hide();
			},
			primary_action_label: __("Submit")
		});
		d.show();
	},

	show_export_logs: function(frm){
		frappe.open_in_new_tab = true;
		frappe.set_route('List', 'DATEV Export Log', {})
	},

	show_report: function(frm){
		frappe.open_in_new_tab = true;
		frappe.set_route('query-report', 'DATEV Sales Invoice Export', {})
	},

	datev_opos_import: function(frm){
		frappe.open_in_new_tab = true;
		frappe.set_route('List', 'DATEV OPOS Import', {})
	}

});

frappe.ui.form.on('DATEV Export Mapping Table', {
	is_empty_column: function (frm, cdt, cdn) {
		var row = locals[cdt][cdn]
		var reqd_val = 0
		if (row.is_empty_column == 1) {
			reqd_val = 1
			frappe.model.set_value(row.doctype, row.name, "sales_invoice_field_id", "");
			frappe.model.set_value(row.doctype, row.name, "customer_field_id", "");
		}
	}
});
