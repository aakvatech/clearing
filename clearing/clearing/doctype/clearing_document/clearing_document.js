// Copyright (c) 2024, Nelson Mpanju and contributors
// For license information, please see license.txt

frappe.ui.form.on('Clearing Document', {
    document_type: function(frm) {
        if (frm.doc.document_type) {
            frappe.call({
                method: 'frappe.client.get',
                args: {
                    doctype: 'Clearing Document Type',
                    name: frm.doc.document_type
                },
                callback: function(r) {
                    if (r.message) {
                        // Clear existing attributes
                        frm.clear_table('clearing_document_attributes');
                        
                        // Populate with new attributes
                        $.each(r.message.clearing_document_attribute, function(idx, attribute) {
                            let child = frm.add_child('clearing_document_attributes');
                            child.document_attribute = attribute.document_attribute;
                            child.document_attribute_value = ''; // You can also set default values if required
                        });

                        frm.refresh_field('clearing_document_attributes');
                    }
                }
            });
        }
    }
});

