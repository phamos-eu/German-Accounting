import frappe
from erpnext.selling.doctype.sales_order.sales_order import SalesOrder as OriginalSalesOrder
from frappe.model.document import Document
from erpnext.accounts.doctype.sales_invoice.sales_invoice import (
	update_linked_doc,
)

class CustomSalesOrder(OriginalSalesOrder):
    def validate(self):
        frappe.msgprint("Germany Accounting APP")
        super().validate()

    def on_submit(self):
        # Override the method and remove self.check_credit_limit()
        self.update_reserved_qty()

        frappe.get_doc("Authorization Control").validate_approving_authority(
            self.doctype, self.company, self.base_grand_total, self
        )
        self.update_project()
        self.update_prevdoc_status("submit")

        self.update_blanket_order()

        update_linked_doc(self.doctype, self.name, self.inter_company_order_reference)
        if self.coupon_code:
            from erpnext.accounts.doctype.pricing_rule.utils import update_coupon_code_count

            update_coupon_code_count(self.coupon_code, "used")