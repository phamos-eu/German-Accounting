import frappe
from frappe.utils import cint, flt
from frappe import _, msgprint


def credit_limit(customer, company, ignore_outstanding_sales_order=False, extra_amount=0):
	credit_limit = get_credit_limit(customer, company)
	if not credit_limit:
		return

	customer_outstanding = get_customer_outstanding(customer, company, ignore_outstanding_sales_order)
	if extra_amount > 0:
		customer_outstanding += flt(extra_amount)

	if credit_limit > 0 and flt(customer_outstanding) > credit_limit:
		msgprint(
			_("Credit limit has been crossed for customer {0} ({1}/{2})").format(
				customer, customer_outstanding, credit_limit
			)
		)

		# If not authorized person raise exception
		credit_controller_role = frappe.db.get_single_value("Accounts Settings", "credit_controller")
		if not credit_controller_role or credit_controller_role not in frappe.get_roles():
			# form a list of emails for the credit controller users
			credit_controller_users = get_users_with_role(credit_controller_role or "Sales Master Manager")

			# form a list of emails and names to show to the user
			credit_controller_users_formatted = [
				get_formatted_email(user).replace("<", "(").replace(">", ")")
				for user in credit_controller_users
			]
			if not credit_controller_users_formatted:
				frappe.throw(
					_("Please contact your administrator to extend the credit limits for {0}.").format(
						customer
					)
				)

			user_list = "<br><br><ul><li>{}</li></ul>".format("<li>".join(credit_controller_users_formatted))

			message = _(
				"Please contact any of the following users to extend the credit limits for {0}: {1}"
			).format(customer, user_list)

			# if the current user does not have permissions to override credit limit,
			# prompt them to send out an email to the controller users
			frappe.msgprint(
				message,
				title="Notify",
				raise_exception=1,
				primary_action={
					"label": "Send Email",
					"server_action": "erpnext.selling.doctype.customer.customer.send_emails",
					"hide_on_success": True,
					"args": {
						"customer": customer,
						"customer_outstanding": customer_outstanding,
						"credit_limit": credit_limit,
						"credit_controller_users_list": credit_controller_users,
					},
				},
			)


@frappe.whitelist()
def get_credit_limit(customer, company):
	credit_limit = None
	if customer:
		credit_limit = frappe.db.get_value(
			"Customer Credit Limit",
			{"parent": customer, "parenttype": "Customer", "company": company},
			"credit_limit",
		)

		if not credit_limit:
			customer_group = frappe.get_cached_value("Customer", customer, "customer_group")

			result = frappe.db.get_values(
				"Customer Credit Limit",
				{"parent": customer_group, "parenttype": "Customer Group", "company": company},
				fieldname=["credit_limit", "bypass_credit_limit_check_quotation"],
				as_dict=True,
			)

			if result and not result[0].bypass_credit_limit_check_quotation:
				credit_limit = result[0].credit_limit

	if not credit_limit:
		credit_limit = frappe.get_cached_value("Company", company, "credit_limit")

	return flt(credit_limit)  


def get_customer_outstanding(party_name, company, total):

	return flt(total)



def check_credit_limit_for_customer(party_name, company, total):
	# if bypass credit limit check is set to true (1) at quotation level,
	# then we need not to check credit limit and vise versa
	if not cint(
        frappe.db.get_value(
                "Customer Credit Limit",
                {"parent": party_name, "parenttype": "Customer", "company": company},
                "bypass_credit_limit_check_quotation",
        )
	):
		credit_limit = get_credit_limit(party_name, company)

		if not credit_limit:
			return

		customer_outstanding =  get_customer_outstanding(party_name, company, total)

		if credit_limit > 0 and flt(customer_outstanding) > credit_limit:

			frappe.throw(
                _("Credit limit has been crossed for customer {0} which has outstanding amount of {1} and credit limit of {2}").format(
                    party_name, customer_outstanding, credit_limit
                )
            )


def check_credit_limit(doc, method=None):
    
    check_credit_limit_for_customer(doc.party_name, doc.company, doc.totall)
