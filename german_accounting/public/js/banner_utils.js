async function getDataForHeadlineText(customer, company, doctype) {
    return new Promise((resolve, reject) => {

        frappe.call({
            method: "german_accounting.events.credit_limit_check.get_headline_data",
            args: {
                customer,
                company,
                doctype
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

function getCreditLimitText(credit_limit, currency_symbol){
    return credit_limit !== '0.00' ?
                `${__('and The Credit Limit is')}: <b>${currency_symbol} ${credit_limit}</b>` :
                `<br> <span class='text-danger'>${__('Credit Limit is not set for this customer')}</span>`;
}

function getHeadlineText(customer, amounts, credit_limit_text ,text_class, currency_symbol){
    const open_invoice_amount = amounts.open_invoice.toFixed(2)
    const overdue_invoice_amount = amounts.overdue_invoice.toFixed(2)
    const non_invoiced_amount = amounts.non_invoice.toFixed(2)
    const total = amounts.total.toFixed(2)

    return `<div class="row">
                <div class="col-xs-12">
                    <span class="indicator whitespace-nowrap ${text_class}">
                        <span class="hidden-xs">
                            <p>
                                ${__("Customer {} has an Open Invoice Amount of: {}, Overdue Invoice Amount of: {} and Non-Invoiced Amount of: {}",[`<b>${customer}</b>`, `<b>${currency_symbol} ${open_invoice_amount}</b>`, `<b>${currency_symbol} ${overdue_invoice_amount}</b>`, `<b>${currency_symbol} ${non_invoiced_amount}</b>`])}
                                <br>
                                ${__("This is a Total of {}", [`<b>${currency_symbol} ${total}</b>`])}
                                ${credit_limit_text}
                            </p>
                        </span>
                    </span>
                </div>
            </div>
           `
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

                        let users = [];
                        $(dialog.$wrapper).find('input[name="user_checkbox"]:checked').each(function() {
                            users.push($(this).val());
                        });
                        
                        // send email
                        frappe.call({
                            method: "german_accounting.events.credit_limit_check.send_emails",
                            args: {
                                users,
                                docname,
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