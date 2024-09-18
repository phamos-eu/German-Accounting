frappe.ui.form.on('Sales Invoice', {
    onload: function(frm){
        if (frm.is_new() && frm.doc.is_return){
            frm.doc.sales_invoice_type = "Invoice Cancellation"
            frm.events.toggle_fields(frm);
        }
        else if (frm.is_new() && frm.doc.items.some(item => item.sales_order)){
            frm.doc.sales_invoice_type = "Sales Invoice"
            frm.events.toggle_fields(frm);
        }   
    },

    before_submit: function(frm){
        if (frm.doc.grand_total === 0) {
            frappe.throw(__("The grand total can't be zero."));
        }
    },

    refresh: function(frm) {
        frm.events.toggle_fields(frm);
    },

    sales_invoice_type: function(frm) {
        frm.events.toggle_fields(frm);
    },

    toggle_fields: function(frm) {
        
            if (frm.doc.sales_invoice_type === "Sales Invoice"){
                // Details tab
                frm.set_df_property('is_pos', 'hidden', true);
                frm.set_df_property('pos_profile', 'hidden', true);
                frm.set_df_property('is_consolidated', 'hidden', true);
                frm.set_df_property('is_return', 'hidden', true);
                frm.set_df_property('return_against', 'hidden', true);
                frm.set_df_property('update_outstanding_for_self', 'hidden', true);
                frm.set_df_property('update_billed_amount_in_sales_order', 'hidden', true);
                frm.set_df_property('update_billed_amount_in_delivery_note', 'hidden', true);
                frm.set_df_property('is_debit_note', 'hidden', true);
                
            }

            if (frm.doc.sales_invoice_type === "Credit Note"){
                // Details tab
                frm.set_df_property('is_return', 'hidden', false);
                frm.set_value('is_return', 1);
                frm.set_df_property('is_return', 'read_only', true);

            }

            if (frm.doc.sales_invoice_type === "Invoice Cancellation"){
                // Details tab
                frm.set_df_property('is_pos', 'hidden', true);

                frm.set_df_property('is_return', 'hidden', false);
                frm.set_value('is_return', 1);
                frm.set_df_property('is_return', 'read_only', true);

                frm.set_value('update_outstanding_for_self', 0);
            }
            
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
    }
});