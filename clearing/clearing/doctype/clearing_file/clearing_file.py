import frappe
from frappe.model.document import Document
from frappe.contacts.doctype.address.address import get_address_display
from frappe import _

class ClearingFile(Document):
    def before_save(self):
        # Check and possibly update status, but do not enforce it strictly
        self.check_and_update_status()

    def before_submit(self):
        # On submit, enforce that all required documents are attached
        self.ensure_all_documents_attached()
        if self.status != "Cleared" or "Delivered" :
            frappe.throw(_("You can't Submit if Clearing file status is not Cleared"))

    def check_and_update_status(self):
        # Required fields for "Pre-Lodged" status
        required_fields = {
            'tancis_lodging_date': self.tancis_lodging_date,
            'reference_no': self.reference_no,
            'tansad_no': self.tansad_no,
            'declaration_type': self.declaration_type,
            'cl_plan': self.cl_plan
        }

        missing_fields = [field_name for field_name, field_value in required_fields.items() if not field_value]

        if not missing_fields:
            self.status = 'Pre-Lodged'
        else:
            pass

    def ensure_all_documents_attached(self):
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

        # If documents are missing, prevent submission
        if missing_docs:
            missing_docs_str = ', '.join(missing_docs)
            frappe.throw(_('The following required documents are missing and must be attached before submission: {0}').format(missing_docs_str), frappe.ValidationError)

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
