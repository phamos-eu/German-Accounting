from erpnext.selling.doctype.customer import customer
from german_accounting.overrides import custom_customer
customer.check_credit_limit = custom_customer._do_nothing