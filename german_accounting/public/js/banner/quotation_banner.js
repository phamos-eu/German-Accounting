
frappe.ui.form.on('Quotation', {
	refresh: (frm) => {
		if(!frm.is_new()) {
			frm.trigger('make_dashboard');
		}
	},
	make_dashboard: (frm) => {
		if(!frm.is_new()) {
            if (frm.doc.party_name) {
                
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
                                    <p>Customer <b>${customer}</b> has an Open Invoice Amount of: <b>${open_invoice_amount}</b>, Overdue Invoice Amount of: <b>${overdue_invoice_amount}</b>, Non-Invoiced Amount of: <b>${non_invoiced_amount}</b>. This is a Total of: <b>${total}</b></p>
                                </span>
                            </span>
                        </div>
                    </div>
                `);        
            }
		}
	}
})