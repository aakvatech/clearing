# Copyright (c) 2024, Nelson Mpanju and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.contacts.doctype.address.address import get_address_display
from frappe import _

class ClearingFile(Document):
    def validate(self):
        self.check_and_update_status()

    def check_and_update_status(self):
        # Required documents for "Pre-Lodged" status
        required_docs = ['Packing List', 'Commercial Invoice']

        # Depending on the mode of transport, check for the specific document
        if self.mode_of_transport == 'Sea':
            required_docs.append('Bill of Lading B/L')
        elif self.mode_of_transport == 'Air':
            required_docs.append('Air Waybill (AWB)')

        # Check if each required document is present in the Clearing File's child table 'documents'
        missing_docs = []
        for doc_name in required_docs:
            exists = any(doc.document_name == doc_name for doc in self.document)
            if not exists:
                missing_docs.append(doc_name)

        # If no documents are missing, update the status to "Pre-Lodged"
        if not missing_docs:
            self.status = 'Pre-Lodged'
        else:
           pass



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
