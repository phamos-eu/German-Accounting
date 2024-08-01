frappe.require('/assets/german_accounting/js/banner_utils.js');

frappe.ui.form.on('Customer', {
    refresh: (frm) => {
        if (!frm.is_new()) {
            frm.trigger('make_dashboard');
        }
    },
    make_dashboard: async (frm) => {
        const { customer_name: customer } = frm.doc;

        if (customer) {
            const { currency_symbol, amounts } = await getDataForHeadlineText(customer);
            const headline_text = getHeadlineText(customer, amounts, '', '', currency_symbol);

            frm.dashboard.clear_headline();
            frm.dashboard.set_headline_alert(headline_text);
        }
    }
});