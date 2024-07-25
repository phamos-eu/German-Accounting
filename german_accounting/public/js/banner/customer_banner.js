frappe.require('/assets/german_accounting/js/banner_utils.js')
frappe.ui.form.on('Customer', {
	refresh: (frm) => {
		if(!frm.is_new()) {
			frm.trigger('make_dashboard');
		}
	},
	make_dashboard: async (frm) => {
        
		if(!frm.is_new()) {
            if (frm.doc.customer_name) {
                const customer = frm.doc.customer_name
                
                const currencySymbol = await getCurrencySymbol()
                const amounts = await updateAmounts(customer)
              
                const open_invoice_amount = amounts.open_invoice.toFixed(2)
                const overdue_invoice_amount = amounts.overdue_invoice.toFixed(2)
                const non_invoiced_amount = amounts.non_invoice.toFixed(2)
                const total = amounts.total.toFixed(2)

                frm.dashboard.clear_headline();

                frm.dashboard.set_headline_alert(`
                    <div class="row">
                        <div class="col-xs-12">
                            <span class="indicator whitespace-nowrap">
                                <span class="hidden-xs">
                                    <p>
                                        ${__("Customer {} has an Open Invoice Amount of: {}, Overdue Invoice Amount of: {} and Non-Invoiced Amount of: {}",[`<b>${customer}</b>`, `<b>${currencySymbol} ${open_invoice_amount}</b>`, `<b>${currencySymbol} ${overdue_invoice_amount}</b>`, `<b>${currencySymbol} ${non_invoiced_amount}</b>`])}
                                        <br>
                                        ${__("This is a Total of {}", [`<b>${currencySymbol} ${total}</b>`])}
                                    </p>
                                </span>
                            </span>
                        </div>
                    </div>
                `);                
            }
		}
	}
})