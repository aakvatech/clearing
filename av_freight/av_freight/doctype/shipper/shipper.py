# Copyright (c) 2024, Nelson Mpanju and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.contacts.doctype.address.address import get_address_display

class Shipper(Document):
    
    def fetch_shipper_address(self):
        if self.shipper_primary_address:
            self.primary_address = get_address_display(self.shipper_primary_address)
                
    def validate(self):
        self.fetch_shipper_address()
