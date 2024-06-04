import frappe
from frappe.utils import cint, flt
from frappe import _, msgprint
import json


@frappe.whitelist()
def submit_sales_order_doc(args):
	args = json.loads(args)
	sales_order_docname = args.get("sales_order_docname")
	customer = args.get("customer")
	company = args.get("company")
	
	frappe.db.set_value(
		"Customer Credit Limit",
		{"parent": customer, "parenttype": "Customer", "company": company},
		"bypass_credit_limit_check",
		1
	)

	doc = frappe.get_doc('Sales Order', sales_order_docname)
	doc.submit()

	frappe.db.set_value(
		"Customer Credit Limit",
		{"parent": customer, "parenttype": "Customer", "company": company},
		"bypass_credit_limit_check",
		0
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
				fieldname=["credit_limit", "bypass_credit_limit_check"],
				as_dict=True,
			)
			if result and not result[0].bypass_credit_limit_check:
				credit_limit = result[0].credit_limit

	if not credit_limit:
		credit_limit = frappe.get_cached_value("Company", company, "credit_limit")

	return flt(credit_limit) 


def get_customer_outstanding(customer, company, total):

	return flt(total)



def check_credit_limit_for_customer(docname, customer, company, total):
	# if bypass credit limit check is set to true (1) at sales_order level,
	# then we need not to check credit limit and vise versa
	if not cint(
        frappe.db.get_value(
                "Customer Credit Limit",
                {"parent": customer, "parenttype": "Customer", "company": company},
                "bypass_credit_limit_check",
        )
	):
		credit_limit = get_credit_limit(customer, company)

		if not credit_limit:
			return

		customer_outstanding =  get_customer_outstanding(customer, company, total)

		if credit_limit > 0 and flt(customer_outstanding) > credit_limit:

			message = _("Credit limit has been crossed for customer {0} which has outstanding  amount of {1} and credit limit of {2}").format(
                customer, customer_outstanding, credit_limit
            )

			frappe.msgprint(
				message,
				title="Confirm",
				raise_exception=1,
				primary_action={
					"label": "Acknowledge",
					"server_action": "german_accounting.events.sales_order_credit_limit_check.submit_sales_order_doc",
					"hide_on_success": True,
					"args": {
						"sales_order_docname": docname,
						"customer": customer,
						"company": company
					},
				},
			)


def check_credit_limit(doc, method=None):
    
    check_credit_limit_for_customer(doc.name, doc.customer, doc.company, doc.totall)