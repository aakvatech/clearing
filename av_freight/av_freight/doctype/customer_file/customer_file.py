import frappe
from frappe.contacts.doctype.address.address import get_address_display
from erpnext.accounts.party import get_party_details

class CustomerFile(frappe.model.document.Document):
    
    def fetch_customer_address(self):
        if self.customer:
            customer_details = get_party_details(self.customer, party_type="Customer")
            self.customer_address = customer_details.get('customer_address')
            self.address = get_address_display(self.customer_address)
            self.contact_person = customer_details.get('contact_person')
            self.contact_mobile = customer_details.get('mobile_no')
            self.contact_email = customer_details.get('contact_email')
            self.customer_name = customer_details.get('customer_name')
            
        if self.shipper_name:
            shipper_details = frappe.get_doc("Shipper",self.shipper_name)
            self.shipper__address = shipper_details.get("shipper_primary_address")
            self.shipper_address_contact = shipper_details.get("primary_address")
            
    def validate(self):
        self.fetch_customer_address()
