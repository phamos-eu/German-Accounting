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

                const data_for_headline_text = await getDataForHeadlineText(customer, company, doctype);
                const currency_symbol = data_for_headline_text.currency_symbol;
                const credit_limit =  data_for_headline_text.credit_limit.toFixed(2);
                const bypass_checked =  data_for_headline_text.bypass_checked;
                const amounts = data_for_headline_text.amounts;
                const total = amounts.total.toFixed(2)
                const credit_limit_text = getCreditLimitText(credit_limit, currency_symbol)

                let text_class = '';
                if ((parseFloat(total) > parseFloat(credit_limit)) && parseFloat(credit_limit) > 0) {
                    if (!bypass_checked){
                        $('button[data-label="Submit"]').off()
                        $('button[data-label="Submit"]').click(() => {checkCreditLimit(frm, customer, company, doctype, docname, total)});
                    }
                    text_class = 'text-danger';
                }

                const headline_text = getHeadlineText(customer ,amounts, credit_limit_text,text_class, currency_symbol)
                
                frm.dashboard.clear_headline();
                frm.dashboard.set_headline_alert(headline_text);            
            }
	}
})