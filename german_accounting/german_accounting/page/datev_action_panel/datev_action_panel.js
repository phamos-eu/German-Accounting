frappe.pages['datev-action-panel'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'None',
		single_column: true
	});

	$(frappe.render_template("datev_action_panel")).appendTo(page.body.addClass("no-border"));
	setup_action_panel(wrapper);
	toggle_section_based_on_company(page, wrapper);

}


function setup_action_panel(wrapper) {
	$(wrapper).find('#create-datev-export-logs').on('click', function(event) {
		event.preventDefault();

		let d = new frappe.ui.Dialog({
			title: __("Select Year and Month"),
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
					method: "german_accounting.german_accounting.page.datev_action_panel.datev_action_panel.create_datev_export_logs",
					args: {
						"month": data.month,
						"year": data.year,
					}
				});
				d.hide();
			},
			primary_action_label: __("Submit")
		});
		d.show();
	});

	$(wrapper).find('#show-export-logs').on('click', function(event) {
		event.preventDefault();
		frappe.open_in_new_tab = true;
		frappe.set_route('List', 'DATEV Export Log');
	});

	$(wrapper).find('#show-report').on('click', function(event) {
		event.preventDefault();
		frappe.open_in_new_tab = true;
		frappe.set_route('query-report', 'DATEV Sales Invoice Export', {})
	});

	$(wrapper).find('#datev-opos-import').on('click', function(event) {
		event.preventDefault();
		frappe.open_in_new_tab = true;
		frappe.set_route('List', 'DATEV OPOS Import', {})
	});
}

function toggle_section_based_on_company(page, wrapper) {
	const company = frappe.defaults.get_user_default("Company");
	if (company) {
		page.set_title(__('DATEV Action Panel for {0}', [company]));
		$(wrapper).find('.default-company-not-set').hide();
		frappe.call({
			method: "german_accounting.german_accounting.page.datev_action_panel.datev_action_panel.get_company_country",
			args: {
				company_name: company
			},
			callback: function(r) {
				const company_details = r.message;
				if (company_details.country === 'Germany') {
					$(wrapper).find('.non-german-company-section').hide();
				} else {
					$(wrapper).find('.show-report-section').hide();
					$(wrapper).find('.create-datev-section').hide();
					$(wrapper).find('.show-export-logs-section').hide();
					$(wrapper).find('.datev-import-section').hide();
				}
			}
		});
	} else {
		page.set_title(__('DATEV Action Panel'));
		$(wrapper).find('.non-german-company-section').hide();
		$(wrapper).find('.show-report-section').hide();
		$(wrapper).find('.create-datev-section').hide();
		$(wrapper).find('.show-export-logs-section').hide();
		$(wrapper).find('.datev-import-section').hide();
	}
}