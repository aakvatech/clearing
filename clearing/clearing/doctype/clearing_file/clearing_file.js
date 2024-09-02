// Copyright (c) 2024, Nelson Mpanju and contributors
// For license information, please see license.txt

frappe.ui.form.on('Clearing File', {
    refresh: function(frm) {
        // Update the "Attach Documents" button to be primary
        const container = document.querySelector('[data-fieldname="attach_documents"]');
        if (container) {
            const button = container.querySelector('button');
            if (button) {
                button.className = 'btn btn-xs btn-default bold btn-primary';
            }
        }

        // Function to handle the creation or redirection of documents
        function handle_clearance_creation(doctype, label, filters, new_doc_data, success_message) {
            frm.add_custom_button(__(`${label}`), function() {
                frappe.call({
                    method: "frappe.client.get_list",
                    args: {
                        doctype: doctype,
                        filters: filters,
                        limit: 1
                    },
                    callback: function(r) {
                        if (r.message && r.message.length > 0) {
                            // If the document exists, redirect to the existing document
                            frappe.set_route('Form', doctype, r.message[0].name);
                        } else {
                            // If the document doesn't exist, create a new one
                            frappe.call({
                                method: "frappe.client.insert",
                                args: {
                                    doc: new_doc_data
                                },
                                callback: function(r) {
                                    if (!r.exc) {
                                        frappe.msgprint(__(`${success_message}`));
                                        frappe.set_route('Form', doctype, r.message.name);
                                    }
                                }
                            });
                        }
                    }
                });
            }, null, 'primary'); // Make the button primary
            
        }

        // Show buttons only if the status is 'Pre-Lodged'
        if (frm.doc.status === 'Pre-Lodged') {
            // Create or redirect for TRA Clearance
            handle_clearance_creation(
                'TRA Clearance',
                'TRA Clearance',
                { clearing_file: frm.doc.name },
                { doctype: 'TRA Clearance', clearing_file: frm.doc.name, customer: frm.doc.customer, status: 'Payment Pending' },
                'TRA Clearance created successfully'
            );

            // Create or redirect for Shipment Clearance
            handle_clearance_creation(
                'Shipment Clearance',
                'Shipment Clearance',
                { clearing_file: frm.doc.name },
                { doctype: 'Shipment Clearance', clearing_file: frm.doc.name, customer: frm.doc.customer, status: 'Unpaid' },
                'Shipment Clearance created successfully'
            );

            // Create or redirect for Physical Verification
            handle_clearance_creation(
                'Physical Verification',
                'Physical Verification',
                { clearing_file: frm.doc.name },
                { doctype: 'Physical Verification', clearing_file: frm.doc.name, customer: frm.doc.customer, status: 'Pending' },
                'Physical Verification created successfully'
            );

            // Create or redirect for Port Clearance
            handle_clearance_creation(
                'Port Clearance',
                'Port Clearance',
                { clearing_file: frm.doc.name },
                { doctype: 'Port Clearance', clearing_file: frm.doc.name, customer: frm.doc.customer, status: 'Unpaid' },
                'Port Clearance created successfully'
            );
        }
        frm.change_custom_button_type('TRA Clearance', null, 'primary');
        frm.change_custom_button_type('Port Clearance', null, 'primary');
        frm.change_custom_button_type('Physical Verification', null, 'primary');
        frm.change_custom_button_type('Shipment Clearance', null, 'primary');
    },

    attach_documents: function(frm) {
        // Create the dialog for document attachment
        let d = new frappe.ui.Dialog({
            title: 'Enter details',
            fields: [
                {
                    label: 'Document Type',
                    fieldname: 'document_type',
                    fieldtype: 'Link',
                    options: 'Clearing Document Type',
                    change: function() {
                        let document_type = d.get_value('document_type');
                        if (document_type) {
                            frappe.call({
                                method: 'frappe.client.get',
                                args: {
                                    doctype: 'Clearing Document Type',
                                    name: document_type
                                },
                                callback: function(r) {
                                    if (r.message && r.message.clearing_document_attribute) {
                                        // Clear the existing rows in the table field
                                        let attributes_table = d.get_field('document_attributes').grid;
                                        attributes_table.df.data = []; // Clear existing data
                                        attributes_table.refresh();

                                        // Populate the table with attributes
                                        r.message.clearing_document_attribute.forEach((aattribute, idx) => {
                                            d.fields_dict.document_attributes.df.data.push({
                                                attribute: aattribute.document_attribute,
                                                value: '' // Leave value blank for the user to fill in
                                            });
                                        });

                                        attributes_table.refresh();
                                    } else {
                                        console.error('No attributes found for the selected document type.');
                                        frappe.msgprint(__('No attributes found for the selected document type.'));
                                    }
                                },
                                error: function(err) {
                                    console.error('Error fetching document type attributes:', err);
                                    frappe.msgprint(__('Failed to retrieve document attributes. Please try again.'));
                                }
                            });
                        }
                    }
                },
                {
                    fieldname: "attach_document",
                    fieldtype: 'Column Break'
                },
                {
                    label: 'Attach Document',
                    fieldname: "attach_document",
                    fieldtype: 'Attach'
                },
                {
                    fieldname: "attach_document",
                    fieldtype: 'Section Break'
                },
                {
                    label: 'Document Attributes',
                    fieldname: 'document_attributes',
                    fieldtype: 'Table',
                    options: 'Clearing Document Attribute',
                    fields: [
                        {
                            fieldname: 'attribute',
                            label: 'Attribute',
                            fieldtype: 'Data',
                            in_list_view: 1
                        },
                        {
                            fieldname: 'value',
                            label: 'Value',
                            fieldtype: 'Data',
                            in_list_view: 1
                        }
                    ]
                }
            ],
            size: 'large',
            primary_action_label: 'Submit',
            primary_action(values) {
                console.log(values);
                // Prepare the child table data
                let clearing_document_attributes = values.document_attributes.map(attr => ({
                    document_attribute: attr.attribute,
                    document_attribute_value: attr.value
                }));
                
                // Get the attachment URL
                let attachment_url = values.attach_document;
            
                // Use Frappe API to create the document
                frappe.call({
                    method: "frappe.client.insert",
                    args: {
                        doc: {
                            doctype: "Clearing Document",
                            clearing_file: frm.doc.name,
                            document_attachment: attachment_url,  // Attach document here
                            clearing_document_type: values.document_type,
                            document_type: values.document_type,
                            clearing_document_attributes: clearing_document_attributes // Handle child table
                        }
                    },
                    callback: function(response) {
                        if (response && response.message) {
                            frappe.msgprint(__('Clearing Document created successfully.'));
                            d.hide();
                        } else {
                            console.error('Failed to create Clearing Document.');
                            frappe.msgprint(__('There was an issue creating the Clearing Document. Please try again.'));
                        }
                    },
                    error: function(err) {
                        console.error('Error during document creation:', err);
                        frappe.msgprint(__('Failed to create Clearing Document. Please try again.'));
                    }
                });
            }
        });

        d.show();
    },

    customer: function(frm) {
        if (frm.doc.customer) {
            frappe.call({
                method: "clearing.clearing.doctype.clearing_file.clearing_file.get_address_display_from_link",
                args: {
                    doctype: "Customer",
                    name: frm.doc.customer
                },
                callback: function(r) {
                    if (r.message) {
                        frm.set_value('address_display', r.message.address_display);
                        frm.set_value('customer_address', r.message.customer_address);
                    } else {
                        frm.set_value('address_display', '');
                        frm.set_value('customer_address', '');
                    }
                }
            });
        } else {
            frm.set_value('address_display', '');
            frm.set_value('customer_address', '');
        }
    },

    // Function to update cargo_description field on the parent doctype
    update_cargo_description: function(frm) {
        let descriptions = frm.doc.cargo_details.map(function(row) {
            return row.cargo_description;
        }).filter(Boolean); // Filters out empty descriptions

        frm.set_value('cargo_description', descriptions.join('\n'));
    },

    after_save: function(frm) {
        frm.trigger('update_cargo_description');
    }
});

frappe.ui.form.on('Cargo Details', {
    cargo_description: function(frm) {
        frm.trigger('update_cargo_description');
    }
});

frappe.ui.form.on('Cargo', {
    package_type: function(frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        var container_number_df = frappe.meta.get_docfield('Cargo', 'container_number', frm.doc.name);
        var seal_number_df = frappe.meta.get_docfield('Cargo', 'seal_number', frm.doc.name);

        if (row.package_type === 'Loose') {
            frappe.model.set_value(cdt, cdn, 'container_number', '');
            frappe.model.set_value(cdt, cdn, 'seal_number', '');
            container_number_df.hidden = 1;
            seal_number_df.hidden = 1;
        } else {
            container_number_df.hidden = 0;
            seal_number_df.hidden = 0;
        }

        frm.fields_dict.cargo_details.grid.toggle_display('container_number', !container_number_df.hidden);
        frm.fields_dict.cargo_details.grid.toggle_display('seal_number', !seal_number_df.hidden);
        frm.fields_dict.cargo_details.grid.refresh();
    }
});
