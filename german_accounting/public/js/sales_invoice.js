frappe.ui.form.on('Sales Invoice', {
    onload: function(frm){
        
        if (frm.is_new() && frm.doc.items.some(item => item.sales_order)){
            frm.doc.custom_sales_invoice_type = "Sales Invoice"
            frm.events.toggle_fields(frm);
        } 
        else if (frm.is_new() && frm.doc.is_return){
            frm.doc.custom_sales_invoice_type = "Invoice Cancellation"
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
            frm.set_df_property('is_pos', 'hidden', true);
            frm.set_df_property('is_return', 'hidden', true);
            frm.set_df_property('is_debit_note', 'hidden', true);

            // Payments tab
            frm.set_df_property('advances_section', 'hidden', true);
            frm.set_df_property('loyalty_points_redemption', 'hidden', true);

            // Contact & Address tab
            frm.set_df_property('dispatch_address_name', 'hidden', true);

            // More Info
            frm.set_df_property('is_opening', 'hidden', true);
            frm.set_df_property('sales_team_section_break', 'hidden', true);
            frm.set_df_property('subscription_section', 'hidden', true);
            frm.set_df_property('more_information', 'hidden', true);
                        
        } else {
            // Details tab
            frm.set_df_property('is_pos', 'hidden', false);
            frm.set_df_property('is_return', 'hidden', false);
            frm.set_df_property('is_debit_note', 'hidden', false);

            // Payments tab
            frm.set_df_property('advances_section', 'hidden', false);
            frm.set_df_property('loyalty_points_redemption', 'hidden', false);

            // Contact & Address tab
            frm.set_df_property('dispatch_address_name', 'hidden', false);

            // More Info
            frm.set_df_property('is_opening', 'hidden', false);
            frm.set_df_property('sales_team_section_break', 'hidden', false);
            frm.set_df_property('subscription_section', 'hidden', false);
            frm.set_df_property('more_information', 'hidden', false);

        }
    }
});