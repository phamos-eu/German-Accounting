async function updateAmounts(customer) {
    return new Promise((resolve, reject) => {

        frappe.call({
            method: "german_accounting.events.update_invoice_amounts.update_amounts",
            args: {
                customer
            },
            callback: function (r) {
                if (r.message !== null && r.message !== undefined) {
                    resolve(r.message);
                } else {
                    reject(new Error('Response not found'));
                }
            },
        });

    });
} 


async function getCreditLimit(customer, company, doctype) {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: 'german_accounting.events.credit_limit_check.get_credit_limit',
            args: {
                customer,
                company,
                doctype
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

async function getCurrencySymbol() {
    
    const global_currency = frappe.defaults.get_global_default("currency");
    const currency_symbol = (await frappe.db.get_value("Currency", global_currency, "symbol")).message.symbol; 

    return currency_symbol
}


async function checkBypass(customer, company, doctype) {
    return new Promise((resolve, reject) => {

        frappe.call({
            method: 'german_accounting.events.credit_limit_check.bypass_checked',
            args: {
                customer,
                company,
                doctype
            },
            callback: function(r) {
                if (r.message !== null && r.message !== undefined) {
                    resolve(r.message);
                } else {
                    reject(new Error('Response not found'));
                }
            }
        });
    })
}


function checkCreditLimit(frm, customer, company, doctype, docname, total) { 
   
    frappe.call({
        method: "german_accounting.events.credit_limit_check.check_credit_limit",
        args: {
            docname,
            customer,
            company,
            total,
            doctype
        },
        callback: function (r) {
            const response = r.message;
           
            const dialog = new frappe.ui.Dialog({
                title: __('Are you sure you want to proceed?'),
                fields: [
                    {
                        fieldtype: 'HTML',
                        fieldname: 'message',
                        options: `<p>${response.message}</p>`
                    },
                    {
                        fieldtype: 'HTML',
                        fieldname: 'users',
                        options: response.users
                    }
                ],
                primary_action_label: (response.button_label),
                primary_action: function() {
                    if (response.button_label == "Submit"){

                        frm.save("Submit");

                    } else {

                        const selectedUsers = [];
                        $(dialog.$wrapper).find('input[name="user_checkbox"]:checked').each(function() {
                            selectedUsers.push($(this).val());
                        });
                        
                        // send email
                        frappe.call({
                            method: "german_accounting.events.credit_limit_check.send_emails",
                            args: {
                                users: selectedUsers,
                                docname: docname,
                                doctype
                            },
                            callback: function (r) {

                                if (r.message) {
                                    if (r.message.status === "success") {
                                        frappe.msgprint({
                                            title: __('Success'),
                                            indicator: 'green',
                                            message: r.message.message
                                        });
                                    } else {
                                        frappe.msgprint({
                                            title: __('Error'),
                                            indicator: 'red',
                                            message: r.message.message
                                        });
                                    }
                                }
                            }
                        })
                    }

                    dialog.hide();
                },
                secondary_action_label: __('Cancel'),
                secondary_action: function() {
                    dialog.hide();
                }
            });

            dialog.show();

            $(dialog.$wrapper).find('#select-all').on('change', function() {
                const isChecked = $(this).is(':checked');
                $(dialog.$wrapper).find('input[name="user_checkbox"]').prop('checked', isChecked);
            });

            $(dialog.$wrapper).find('.modal-footer .btn-primary').addClass('btn-danger').removeClass('btn-primary');
        }
    });
}