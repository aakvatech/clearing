# Copyright (c) 2024, Nelson Mpanju and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.contacts.doctype.address.address import get_address_display

class ClearingFile(Document):
    def validate(self):
        self.check_mandatory_fields_and_attachments()

    def check_mandatory_fields_and_attachments(self):
        mandatory_fields = [
            'air_waybill',
            'bill_of_lading_number',
            'commercial_invoice_number'
        ]
        
        # Mapping of field names to the document type they correspond to
        field_to_doc_type = {
            'air_waybill': 'Air Waybill',
            'bill_of_lading_number': 'Bill of Lading',
            'commercial_invoice_number': 'Commercial Invoice'
        }

        for field in mandatory_fields:
            if getattr(self, field):
                # Check if corresponding document is attached in the child table
                attached = any(
                    child.name1 == field_to_doc_type[field] and child.attachment
                    for child in self.documents
                )
                if not attached:
                    frappe.throw(f"Please attach the corresponding document for {field.replace('_', ' ').title()}.")

@frappe.whitelist()
def get_address_display_from_link(doctype, name):
    if not doctype or not name:
        return {"address_display": "", "customer_address": ""}
    
    addresses = frappe.get_all('Address', filters={'link_doctype': doctype, 'link_name': name}, fields=['name'])
    
    if not addresses:
        return {"address_display": "", "customer_address": ""}
    
    address = frappe.get_doc("Address", addresses[0].name)
    address_display = get_address_display(address.as_dict())
    
    return {"address_display": address_display, "customer_address": addresses[0].name}
