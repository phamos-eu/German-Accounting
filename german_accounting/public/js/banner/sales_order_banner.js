
frappe.ui.form.on('Sales Order', {
    customer: async (frm) => {
        await updateAmounts(frm)
    },
    onload: async (frm) => {
        await updateAmounts(frm)
    },
	refresh: (frm) => {
		// if(!frm.is_new()) {
			frm.trigger('make_dashboard');
		// }
	},
	make_dashboard: async (frm) => {
		// if(!frm.is_new()) {
            if (frm.doc.customer && frm.doc.open_invoice_amount!=null) {
                const currencySymbol = await getDefaultCurrencySymbol();
                const credit_limit =  (await getCreditLimit(frm.doc.customer, frm.doc.company)).toFixed(2);
				let customer = frm.doc.customer
                let open_invoice_amount = frm.doc.open_invoice_amount.toFixed(2)
                let overdue_invoice_amount = frm.doc.overdue_invoice_amount.toFixed(2)
                let non_invoiced_amount = frm.doc.non_invoiced_amount.toFixed(2)
                
                let total = frm.doc.totall.toFixed(2)

                let creditLimitText = credit_limit !== '0.00' ? `and The Credit Limit is: <b>${currencySymbol} ${credit_limit}</b>` : `<br> <span style="color: #ff4d4d;">Credit Limit is not set for this customer</span>`;

                let textColor = '#1366AE'; // Default text color
                if ((parseFloat(total) > parseFloat(credit_limit)) && parseFloat(credit_limit) > 0) {
                    $('button[data-label="Submit"]').off()
                    $('button[data-label="Submit"]').click(() => {cur_frm.save("Submit")});
                    textColor = '#ff4d4d'; // Red text color
                }

                frm.dashboard.clear_headline();
                
                frm.dashboard.set_headline_alert(`
                    <div class="row">
                        <div class="col-xs-12">
                            <span class="indicator whitespace-nowrap" style="color: ${textColor};">
                                <span class="hidden-xs">
                                    <p>Customer <b>${customer}</b> has an Open Invoice Amount of: <b>${currencySymbol} ${open_invoice_amount}</b>, Overdue Invoice Amount of: <b>${currencySymbol} ${overdue_invoice_amount}</b> and Non-Invoiced Amount of: <b>${currencySymbol} ${non_invoiced_amount}</b><br> This is a Total of: <b>${currencySymbol} ${total}</b> ${creditLimitText} </p>
                                </span>
                            </span>
                        </div>
                    </div>
                `);
            }
		// }
	}
})


async function updateAmounts(frm) {

    const customer = frm.doc.customer
    frappe.call({
        method: "german_accounting.events.sales_order_amount.update_amounts",
        args: {
            customer: customer
        },
        callback: function (r) {
           const val = r.message
           frm.doc.open_invoice_amount = val[0]
           frm.doc.overdue_invoice_amount = val[1]
           frm.doc.non_invoiced_amount = val[2]
           frm.doc.totall = val[3]
        },
    });
}


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


async function getCreditLimit(customer, company) {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: 'german_accounting.events.quotation_credit_limit_check.get_credit_limit',
            args: {
                customer: customer,
                company: company
            },
            callback: function(r) {
                if (r.message !== null && r.message !== undefined) {
                    resolve(r.message);
                } else {
                    resolve(0);
                }
            }
        });
    });
}