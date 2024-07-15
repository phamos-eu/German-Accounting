frappe.ui.form.on('Sales Invoice', {
    onload: function(frm){
        if (frm.is_new() && frm.doc.is_return){
            frm.doc.custom_sales_invoice_type = "Invoice Cancellation"
            frm.events.toggle_fields(frm);
        }
        else if (frm.is_new() && frm.doc.items.some(item => item.sales_order)){
            frm.doc.custom_sales_invoice_type = "Sales Invoice"
            frm.events.toggle_fields(frm);
        }   
    },
    refresh: function(frm) {
        frm.events.toggle_fields(frm);
    },

    custom_sales_invoice_type: function(frm) {
        frm.events.toggle_fields(frm);
    },

    toggle_fields: function(frm) {
        
        if (frm.doc.custom_sales_invoice_type) {
            // Details tab
            frm.set_df_property('is_pos', 'read_only', true);
            frm.set_df_property('is_return', 'read_only', true);
            frm.set_df_property('is_debit_note', 'read_only', true);

            // Payments tab

                // advance section
            frm.set_df_property('allocate_advances_automatically', 'read_only', true);
            frm.set_df_property('only_include_allocated_payments', 'read_only', true);
            frm.set_df_property('get_advances', 'read_only', true);
            frm.set_df_property('advances', 'read_only', true);
            
                // loyalty section
            frm.set_df_property('redeem_loyalty_points', 'read_only', true);
            frm.set_df_property('loyalty_points', 'read_only', true);
            frm.set_df_property('loyalty_program', 'read_only', true);
            

            // Contact & Address tab
            frm.set_df_property('dispatch_address_name', 'read_only', true);

            // More Info tab
            frm.set_df_property('is_opening', 'read_only', true);

                // commission section
            frm.set_df_property('sales_partner', 'read_only', true);
            frm.set_df_property('amount_eligible_for_commission', 'read_only', true);
            frm.set_df_property('commission_rate', 'read_only', true);
            frm.set_df_property('total_commission', 'read_only', true);

                // subscription section
            frm.set_df_property('from_date', 'read_only', true);
            frm.set_df_property('to_date', 'read_only', true);

                // additional info section
            frm.set_df_property('status', 'read_only', true);
            frm.set_df_property('campaign', 'read_only', true);
            frm.set_df_property('source', 'read_only', true);
            frm.set_df_property('customer_group', 'read_only', true);
            frm.set_df_property('is_internal_customer', 'read_only', true);
            frm.set_df_property('is_discounted', 'read_only', true);
            frm.set_df_property('remarks', 'read_only', true);

            
                        
        } else {
            // Details tab
            frm.set_df_property('is_pos', 'read_only', false);
            frm.set_df_property('is_return', 'read_only', false);
            frm.set_df_property('is_debit_note', 'read_only', false);

            // Payments tab
                // advance section
            frm.set_df_property('allocate_advances_automatically', 'read_only', false);
            frm.set_df_property('only_include_allocated_payments', 'read_only', false);
            frm.set_df_property('get_advances', 'read_only', false);
            frm.set_df_property('advances', 'read_only', false);

                // loyalty section
            frm.set_df_property('redeem_loyalty_points', 'read_only', false);
            frm.set_df_property('loyalty_points', 'read_only', false);
            frm.set_df_property('loyalty_program', 'read_only', false);

            // Contact & Address tab
            frm.set_df_property('dispatch_address_name', 'read_only', false);

            // More Info tab
            frm.set_df_property('is_opening', 'read_only', false);

                // commission section
            frm.set_df_property('sales_partner', 'read_only', false);
            frm.set_df_property('amount_eligible_for_commission', 'read_only', false);
            frm.set_df_property('commission_rate', 'read_only', false);
            frm.set_df_property('total_commission', 'read_only', false);

                // subscription section
            frm.set_df_property('from_date', 'read_only', false);
            frm.set_df_property('to_date', 'read_only', false);

                // additional info section
            frm.set_df_property('status', 'read_only', false);
            frm.set_df_property('campaign', 'read_only', false);
            frm.set_df_property('source', 'read_only', false);
            frm.set_df_property('customer_group', 'read_only', false);
            frm.set_df_property('is_internal_customer', 'read_only', false);
            frm.set_df_property('is_discounted', 'read_only', false);
            frm.set_df_property('remarks', 'read_only', false);

        }
    }
});