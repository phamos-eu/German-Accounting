
frappe.ui.form.on('Quotation', {
	refresh: (frm) => {
		if(!frm.is_new()) {
			frm.trigger('make_dashboard');
		}
	},
	make_dashboard: async (frm) => {
		if(!frm.is_new()) {
            if (frm.doc.party_name) {
                const currencySymbol = await getDefaultCurrencySymbol();

                let customer = frm.doc.party_name
                let open_invoice_amount = frm.doc.open_invoice_amount.toFixed(2)
                let overdue_invoice_amount = frm.doc.overdue_invoice_amount.toFixed(2)
                let non_invoiced_amount = frm.doc.non_invoiced_amount.toFixed(2)
                let total = frm.doc.totall.toFixed(2)

                frm.dashboard.set_headline_alert(`
                    <div class="row">
                        <div class="col-xs-12">
                            <span class="indicator whitespace-nowrap">
                                <span class="hidden-xs">
                                    <p>Customer <b>${customer}</b> has an Open Invoice Amount of: <b>${currencySymbol} ${open_invoice_amount}</b>, Overdue Invoice Amount of: <b>${currencySymbol} ${overdue_invoice_amount}</b> and Non-Invoiced Amount of: <b>${currencySymbol} ${non_invoiced_amount}</b>.<br> This is a Total of: <b>${currencySymbol} ${total}</b>.</p>
                                </span>
                            </span>
                        </div>
                    </div>
                `);        
            }
		}
	}
})


async function getDefaultCurrencySymbol() {
    try {

        const response = await fetch("/api/resource/Global Defaults/Global Defaults");
        const data = await response.json();

        const currencyCode = data.data.default_currency;

        const currencyResponse = await fetch(`/api/resource/Currency/${currencyCode}`);
        const currencyData = await currencyResponse.json();

        const currencySymbol = currencyData.data.symbol;

        return currencySymbol;
    } catch (error) {
        console.error("Error fetching default currency symbol:", error);
        return null;
    }
}