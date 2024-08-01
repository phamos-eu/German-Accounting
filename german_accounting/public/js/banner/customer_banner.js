frappe.require('/assets/german_accounting/js/banner_utils.js')
frappe.ui.form.on('Customer', {
	refresh: (frm) => {
		if(!frm.is_new()) {
			frm.trigger('make_dashboard');
		}
	},
	make_dashboard: async (frm) => {
        
            if (frm.doc.customer_name) {
                const customer = frm.doc.customer_name
                const data_for_headline_text = await getDataForHeadlineText(customer);
                const currency_symbol = data_for_headline_text.currency_symbol;
                const amounts = data_for_headline_text.amounts;
                const headline_text = getHeadlineText(customer ,amounts,'','', currency_symbol)

                frm.dashboard.clear_headline();
                frm.dashboard.set_headline_alert(headline_text);                
            }
		}
})