import frappe
from frappe.utils import cint, flt
from frappe import _, msgprint
import json
from frappe.query_builder import DocType


def get_users_with_role(role: str) -> list[str]:
	User = DocType("User")
	HasRole = DocType("Has Role")

	return (
		frappe.qb.from_(HasRole)
		.from_(User)
		.where(
			(HasRole.role == role)
			& (User.enabled == 1)
			& (HasRole.parent == User.name)
		)
		.select(User.email)
		.distinct()
		.run(pluck=True)
	)

@frappe.whitelist()
def send_emails(users, docname, doctype):
	try:

		users = json.loads(users)
		subject = _("Request for document release {0}.").format(docname)
		message = _("Please release the following document {0}.").format( frappe.utils.get_url_to_form(doctype, docname))
		
		frappe.sendmail(
			recipients= users, 
			subject=subject, 
			message=message,
			delayed=False,
			retry=3 
		)
		return {"status": "success", "message": _("Email sent successfully.")}
	except Exception as e:
		return {"status": "error", "message": str(e)}

def get_credit_limit(customer, company, doctype=None):
	credit_limit = None

	if customer:
		credit_limit = frappe.db.get_value(
			"Customer Credit Limit",
			{"parent": customer, "parenttype": "Customer", "company": company},
			"credit_limit",
		)
		
		if not credit_limit and doctype == 'Sales Order':
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


def bypass_checked(customer, company, doctype):

	if doctype == 'Sales Order':
		return cint(
			frappe.db.get_value(
					"Customer Credit Limit",
					{"parent": customer, "parenttype": "Customer", "company": company},
					"bypass_credit_limit_check",
			)
		)

	return 0		


def check_credit_limit_for_customer(customer, company, customer_outstanding, doctype):
	# if bypass credit limit check is set to true (1) at sales_order,
	# then we need not to check credit limit and vise versa
	if not bypass_checked(customer, company, doctype):

		credit_limit = get_credit_limit(customer, company, doctype)
		if not credit_limit:
			return
			
		if credit_limit > 0 and flt(customer_outstanding) > credit_limit:
				
			message = _("Credit limit has been crossed for customer {0} which has total outstanding amount of {1} and credit limit of {2}").format(
					customer, customer_outstanding, credit_limit
			)
			return message

@frappe.whitelist()
def check_credit_limit(docname, customer, company, total, doctype, method=None):
  
	message = check_credit_limit_for_customer(customer, company, total, doctype)

	if message is None:
		message = ""

	table = ""
	button_label = "Submit"
	
	if doctype != "Quotation":
		role = frappe.get_cached_doc("German Accounting Settings").credit_limit_controller_role
		if not role:
			frappe.throw(
				_("Please set the credit controller role on {0}")
				.format(frappe.utils.get_link_to_form("German Accounting Settings", "German Accounting Settings"))
			)

		if not frappe.db.exists("Has Role", {"parent": frappe.session.user, "role": role, "parenttype": "User"}):
			button_label = "Request Approval"
			formatted_user_rows = ""
			users = get_users_with_role(role)

			for user in users:
				formatted_user_rows += f"""
						<tr>
							<td style="padding: 5px;"><input type="checkbox" name="user_checkbox" value="{user}"></td>
							<td style="padding: 5px;">{user}</td>
						</tr>"""

			table= """
					<table>
						<thead>
							<tr>
								<th style="padding: 5px;"><input type="checkbox" id="select-all"></th>
								<th style="padding: 5px;">{}</th>
							</tr>
						</thead>
						<tbody>
							{}
						</tbody>
					</table>
			""".format(_("Users"), formatted_user_rows)

	return {
		"message": message, 
		"users": table, 
		"button_label": button_label
	}


@frappe.whitelist()
def get_headline_data(customer, company=None, doctype=None):
	from german_accounting.events.invoice_amounts import get_amounts
	
	headline_data = {}
	headline_data["amounts"] = get_amounts(customer)
	headline_data["currency_symbol"] = frappe.get_cached_value("Currency", frappe.defaults.get_global_default("currency"), "symbol")
	if company and doctype:
		headline_data["check_bypass"] = bypass_checked(customer, company, doctype)
		headline_data["credit_limit"] = get_credit_limit(customer, company, doctype)

	return headline_data
