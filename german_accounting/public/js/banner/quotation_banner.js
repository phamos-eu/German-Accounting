frappe.require('/assets/german_accounting/js/banner_utils.js')
frappe.ui.form.on('Quotation', {
    party_name: async (frm) => {
        if(frm.doc.party_name) {
            frm.trigger('make_dashboard');
        }
    },
	refresh: (frm) => {
			frm.trigger('make_dashboard');
	},
	make_dashboard: async (frm) => {
		
            if (frm.doc.party_name) {
                const customer = frm.doc.party_name
                const company = frm.doc.company
                const doctype = frm.doc.doctype
                const docname = frm.doc.name

                const currencySymbol = await getCurrencySymbol()
                const credit_limit =  (await getCreditLimit(customer, company, doctype)).toFixed(2);
                const bypass_checked = await checkBypass(customer, company, doctype);
                const amounts = await updateAmounts(customer)
                

                const open_invoice_amount = amounts.open_invoice.toFixed(2)
                const overdue_invoice_amount = amounts.overdue_invoice.toFixed(2)
                const non_invoiced_amount = amounts.non_invoice.toFixed(2)
                const total = amounts.total.toFixed(2)

                let creditLimitText = credit_limit !== '0.00' ?
                `${__('and The Credit Limit is')}: <b>${currencySymbol} ${credit_limit}</b>` :
                `<br> <span style="color: #ff4d4d;">${__('Credit Limit is not set for this customer')}</span>`;

                let textClass = '';
                if ((parseFloat(total) > parseFloat(credit_limit)) && parseFloat(credit_limit) > 0) {
                    if (!bypass_checked){
                        $('button[data-label="Submit"]').off()
                        $('button[data-label="Submit"]').click(() => {checkCreditLimit(frm, customer, company, doctype, docname, total)});
                    }
                    textClass = 'text-danger';
                }
                frm.dashboard.clear_headline();

                frm.dashboard.set_headline_alert(`
                    <div class="row">
                        <div class="col-xs-12">
                            <span class="indicator whitespace-nowrap ${textClass}">
                                <span class="hidden-xs">
                                    <p>
                                        ${__("Customer {} has an Open Invoice Amount of: {}, Overdue Invoice Amount of: {} and Non-Invoiced Amount of: {}",[`<b>${customer}</b>`, `<b>${currencySymbol} ${open_invoice_amount}</b>`, `<b>${currencySymbol} ${overdue_invoice_amount}</b>`, `<b>${currencySymbol} ${non_invoiced_amount}</b>`])}
                                        <br>
                                        ${__("This is a Total of {}", [`<b>${currencySymbol} ${total}</b>`])}
                                        ${creditLimitText}
                                    </p>
                                </span>
                            </span>
                        </div>
                    </div>
                `);            
            }
	}
})