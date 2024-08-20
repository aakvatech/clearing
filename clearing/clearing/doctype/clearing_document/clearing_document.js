// Copyright (c) 2024, Nelson Mpanju and contributors
// For license information, please see license.txt

frappe.ui.form.on('Clearing Document', {

    refresh: function(frm) {
        frm.set_query('document_type', function() {
            if (frm.doc.linked_file) {
                return {
                    filters: {
                        linked_document: frm.doc.linked_file
                    }
                };
            } else {
                frappe.msgprint(__('Please select a Linked Document first.'));
            }
        });
    },


    linked_file: function(frm) {
        frm.trigger('refresh');
    },

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
                        
                        frm.clear_table('clearing_document_attributes');

                        
                        $.each(r.message.clearing_document_attribute, function(idx, attribute) {
                            let child = frm.add_child('clearing_document_attributes');
                            child.document_attribute = attribute.document_attribute;
                            child.document_attribute_value = ''; 
                        });

                        frm.refresh_field('clearing_document_attributes');
                    }
                }
            });
        }
    }
});
