# Copyright (c) 2024, Nelson Mpanju and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

class ShipmentClearance(Document):
	def before_submit(self):
		if self.status != "Paid":
			frappe.throw(_("You can't Submit if Payment Completed  is not Completed"))
