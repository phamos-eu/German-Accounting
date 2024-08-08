// Copyright (c) 2024, phamos.eu and contributors
// For license information, please see license.txt

frappe.ui.form.on('DATEV Action Panel', {
	refresh: function(frm){
		const company = frappe.defaults.get_default("company")
		frappe.call({
            method: "german_accounting.german_accounting.doctype.datev_action_panel.datev_action_panel.get_company_details",
            args: {
                company_name: company
            },
            callback: function(r) {
				const company_details = r.message;
				$('.title-area .title-text').text('DATEV Action Panel for ' + company_details.company_name);
				if (company_details.country === 'Germany') {
					frm.set_df_property('non_german_company_html', 'hidden', true);

				} else {
					frm.set_df_property('datev_exports_section', 'hidden', true);
					frm.set_df_property('show_report_html', 'hidden', true);
					frm.set_df_property('column_break_p4usw', 'hidden', true);
					frm.set_df_property('show_report', 'hidden', true);
					frm.set_df_property('section_break_dteax', 'hidden', true);
					frm.set_df_property('create_datev_html', 'hidden', true);
					frm.set_df_property('column_break_ltkjn', 'hidden', true);
					frm.set_df_property('create_datev_export_logs', 'hidden', true);
					frm.set_df_property('section_break_61fja', 'hidden', true);
					frm.set_df_property('show_export_logs_html', 'hidden', true);
					frm.set_df_property('column_break_6sdmb', 'hidden', true);
					frm.set_df_property('show_export_logs', 'hidden', true);
					frm.set_df_property('datev_imports_section', 'hidden', true);
					frm.set_df_property('datev_import_html', 'hidden', true);
					frm.set_df_property('column_break_hlyij', 'hidden', true);
					frm.set_df_property('datev_opos_import', 'hidden', true);					
				}
			}
		})
	},
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
			],
			primary_action: async function () {
				let data = d.get_values();
				frappe.call({
					method: "german_accounting.german_accounting.doctype.datev_action_panel.datev_action_panel.create_datev_export_logs",
					args: {
						"month": data.month,
						"year": data.year,
						"company": frappe.defaults.get_default("company"),
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
