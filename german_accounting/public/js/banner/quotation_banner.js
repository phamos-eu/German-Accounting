frappe.require('/assets/german_accounting/js/banner_utils.js');

frappe.ui.form.on('Quotation', {
    party_name: (frm) => {
        if (frm.doc.party_name) {
            frm.trigger('make_dashboard');
        }
    },
    refresh: (frm) => {
        frm.trigger('make_dashboard');
    },
    before_submit: async (frm) => {
        const { party_name: customer, company, doctype, name: docname } = frm.doc;
        const { amounts, credit_limit, check_bypass } = await getDataForHeadlineText(customer, company, doctype);
        const total = parseFloat(amounts.total).toFixed(2);

        if (parseFloat(total) > parseFloat(credit_limit) && parseFloat(credit_limit) > 0 && !check_bypass) {
            frappe.validated = false;
            checkCreditLimit(frm, customer, company, doctype, docname, total);
        }
    },
    make_dashboard: async (frm) => {
        const { party_name: customer, company, doctype } = frm.doc;

        if (customer) {
            const { currency_symbol, credit_limit, amounts } = await getDataForHeadlineText(customer, company, doctype);
            const total = parseFloat(amounts.total).toFixed(2);
            const credit_limit_text = getCreditLimitText(parseFloat(credit_limit).toFixed(2), currency_symbol);

            let text_class = '';
            if (parseFloat(total) > parseFloat(credit_limit) && parseFloat(credit_limit) > 0) {
                text_class = 'text-danger';
            }

            const headline_text = getHeadlineText(customer, amounts, credit_limit_text, text_class, currency_symbol);
            frm.dashboard.clear_headline(); 
            frm.dashboard.set_headline_alert(headline_text);
        }
    }
});
