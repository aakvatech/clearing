# Copyright (c) 2024, Nelson Mpanju and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.contacts.doctype.address.address import get_address_display

class ClearingFile(Document):
    pass

@frappe.whitelist()
def get_address_display_from_customer(customer):
    if not customer:
        return {"address_display": "", "customer_address": ""}
    addresses = frappe.get_all('Address', filters={'link_doctype': 'Customer', 'link_name': customer}, fields=['name'])
    if not addresses:
        return {"address_display": "", "customer_address": ""}
    address = frappe.get_doc("Address", addresses[0].name)
    address_display = get_address_display(address.as_dict())
    return {"address_display": address_display, "customer_address": addresses[0].name}

@frappe.whitelist()
def get_dynamic_link_doctype(doctype, txt, searchfield, start, page_len, filters):
    filters = frappe.parse_json(filters)
    if filters.get('doctype') == 'Shipline':
        return frappe.db.sql("""SELECT name FROM `tabShipline` WHERE name LIKE %(txt)s""", {'txt': '%%%s%%' % txt})
    elif filters.get('doctype') == 'Airline':
        return frappe.db.sql("""SELECT name FROM `tabAirline` WHERE name LIKE %(txt)s""", {'txt': '%%%s%%' % txt})
    else:
        return []