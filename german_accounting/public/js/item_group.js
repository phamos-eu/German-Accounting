frappe.ui.form.on("Item Group", {
    onload: function (frm) {
		frm.fields_dict["german_accounting_taxes"].grid.get_field("income_account").get_query = function (
			doc,
			cdt,
			cdn
		) {
			const row = locals[cdt][cdn];
			return {
				query: "erpnext.controllers.queries.get_income_account",
				filters: { company: row.company },
			};
		};

		frm.fields_dict["german_accounting_taxes"].grid.get_field("item_tax_template").get_query = function (
			doc,
			cdt,
			cdn
		) {
			const row = locals[cdt][cdn];
			return {
				filters: {
					company: row.company,
				},
			};
		};

		frm.fields_dict["german_accounting_taxes"].grid.get_field("sales_taxes_and_charges_template").get_query = function (
			doc,
			cdt,
			cdn
		) {
			const row = locals[cdt][cdn];
			return {
				filters: {
					company: row.company,
				},
			};
		};
    }
})