# Copyright (c) 2024, Nelson Mpanju and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document

class TRAClearance(Document):
    def before_save(self):
        if self.tansad and self.tansad_date and self.tansad_reference_number:
            self.status = "Payment Completed"