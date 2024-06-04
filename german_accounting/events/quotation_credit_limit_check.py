import frappe
from frappe.utils import cint, flt
from frappe import _, msgprint
import json


@frappe.whitelist()
def submit_quotation_doc(args):
	args = json.loads(args)
	quotation_docname = args.get("quotation_docname")
	party_name = args.get("party_name")
	company = args.get("company")
	
	frappe.db.set_value(
		"Customer Credit Limit",
		{"parent": party_name, "parenttype": "Customer", "company": company},
		"bypass_credit_limit_check_quotation",
		1
	)

	doc = frappe.get_doc('Quotation', quotation_docname)
	doc.submit()

	frappe.db.set_value(
		"Customer Credit Limit",
		{"parent": party_name, "parenttype": "Customer", "company": company},
		"bypass_credit_limit_check_quotation",
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



def check_credit_limit_for_customer(docname, party_name, company, total):
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

			message = _("Credit limit has been crossed for customer {0} which has outstanding  amount of {1} and credit limit of {2}").format(
                party_name, customer_outstanding, credit_limit
            )

			frappe.msgprint(
				message,
				title="Confirm",
				raise_exception=1,
				primary_action={
					"label": "Acknowledge",
					"server_action": "german_accounting.events.quotation_credit_limit_check.submit_quotation_doc",
					"hide_on_success": True,
					"args": {
						"quotation_docname": docname,
						"party_name": party_name,
						"company": company
					},
				},
			)

def check_credit_limit(doc, method=None):
    
    check_credit_limit_for_customer(doc.name, doc.party_name, doc.company, doc.totall)