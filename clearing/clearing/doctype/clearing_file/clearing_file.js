// Copyright (c) 2024, Nelson Mpanju and contributors
// For license information, please see license.txt

frappe.ui.form.on('Clearing File', {
    refresh: function(frm) {
        if (!frm.custom_buttons['Create Customs Clearance']) {
            frm.add_custom_button(__('Create Customs Clearance'), function() {
                // Code to create Customs Clearance
                frappe.call({
                    method: "frappe.client.insert",
                    args: {
                        doc: {
                            doctype: "Customs Clearance",
                            clearing_file_number: frm.doc.name,
                            customer: frm.doc.customer,
                            clearing_agent: frm.doc.clearing_agent,
                            status: "Payment Pending"
                        }
                    },
                    callback: function(r) {
                        if (!r.exc) {
                            frappe.msgprint(__('Customs Clearance created successfully'));
                            // Optionally, redirect to the new document
                            frappe.set_route('Form', 'Customs Clearance', r.message.name);
                        }
                    }
                });
            }, 'Create');
        }
    },
    customer: function(frm) {
        if (frm.doc.customer) {
            frappe.call({
                method: "clearing.clearing.doctype.clearing_file.clearing_file.get_address_display_from_link",
                args: {
                    "doctype": "Customer",
                    "name": frm.doc.customer
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
    // Function to update cargo_description field on parent doctype
    update_cargo_description: function(frm) {
        let descriptions = [];
        frm.doc.cargo_details.forEach(function (row) {
            if (row.cargo_description) {
                descriptions.push(row.cargo_description);
            }
        });
        frm.set_value('cargo_description', descriptions.join('\n'));
    }
});

// Trigger update when the form is loaded
frappe.ui.form.on('Clearing File', {
    refreshafter_save: function(frm) {
        frm.trigger('update_cargo_description');
    }
});

// Trigger update when a row in the child table is added or edited
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

        if (row.package_type == 'Loose') {
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

