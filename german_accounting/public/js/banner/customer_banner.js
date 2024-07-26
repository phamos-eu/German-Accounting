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
                const currency_symbol = await getCurrencySymbol()
                const amounts = await updateAmounts(customer)                
                const headline_text = getHeadlineText(customer ,amounts,'','', currency_symbol)

                frm.dashboard.clear_headline();
                frm.dashboard.set_headline_alert(headline_text);                
            }
		}
})