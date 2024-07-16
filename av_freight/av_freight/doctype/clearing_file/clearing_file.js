// Copyright (c) 2024, Nelson Mpanju and contributors
// For license information, please see license.txt

frappe.ui.form.on('Clearing File', {
    onload: function(frm) {
        frm.trigger('mode_of_transport');
    },
    refresh: function(frm) {
        frm.fields_dict.cargo_details.grid.wrapper.on('grid-row-added', function(e, grid_row) {
            if (grid_row.doc.doctype === 'Cargo') {
                grid_row.toggle_view(true);
            }
        });
    },
    customer: function(frm) {
        if (frm.doc.customer) {
            frappe.call({
                method: "av_freight.av_freight.doctype.clearing_file.clearing_file.get_address_display_from_customer",
                args: {
                    "customer": frm.doc.customer
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
    mode_of_transport: function(frm) {
        frm.trigger('toggle_fields_based_on_transport');
    },
    carrier_name: function(frm) {
        if (frm.doc.carrier_name && frm.doc.mode_of_transport) {
            if (frm.doc.mode_of_transport == 'Sea') {
                frm.fields_dict['voyage_flight_number'].get_query = function(doc) {
                    return {
                        filters: {
                            'shipping_line': frm.doc.carrier_name
                        }
                    };
                };
            } else if (frm.doc.mode_of_transport == 'Air') {
                frm.fields_dict['voyage_flight_number'].get_query = function(doc) {
                    return {
                        filters: {
                            'airline': frm.doc.carrier_name
                        }
                    };
                };
            }
        } else {
            frm.fields_dict['voyage_flight_number'].get_query = function(doc) {
                return {
                    filters: {}
                };
            };
        }
        frm.set_value('voyage_flight_number', '');
    },
    toggle_fields_based_on_transport: function(frm) {
        if (frm.doc.mode_of_transport == 'Sea') {
            frm.set_df_property('carrier_name', 'options', 'Shipline');
            frm.set_df_property('voyage_flight_number', 'options', 'Shipment Vessel');
            
            frm.toggle_display('carrier_name', true);
            frm.toggle_display('voyage_flight_number', true);
            frm.toggle_display('bill_of_lading_number', true);
            frm.toggle_display('commercial_invoice_number', true);
            
            // Hide fields related to Air transport
            frm.toggle_display('flight_number', false);
            frm.toggle_display('airline', false);
        } else if (frm.doc.mode_of_transport == 'Air') {
            frm.set_df_property('carrier_name', 'options', 'Airline');
            frm.set_df_property('voyage_flight_number', 'options', 'Airplane');
            
            frm.toggle_display('carrier_name', true);
            frm.toggle_display('voyage_flight_number', true);
            
            // Hide fields related to Sea transport
            frm.toggle_display('bill_of_lading_number', false);
            frm.toggle_display('commercial_invoice_number', false);
            frm.toggle_display('voyage_number', false);

            // Show fields related to Air transport
            frm.toggle_display('flight_number', true);
            frm.toggle_display('airline', true);
        } else {
            frm.set_df_property('carrier_name', 'options', '');
            frm.set_df_property('voyage_flight_number', 'options', '');
            
            // Hide all fields if mode of transport is not selected
            frm.toggle_display('carrier_name', false);
            frm.toggle_display('voyage_flight_number', false);
            frm.toggle_display('bill_of_lading_number', false);
            frm.toggle_display('commercial_invoice_number', false);
            frm.toggle_display('flight_number', false);
            frm.toggle_display('airline', false);
        }
        frm.set_value('carrier_name', '');
        frm.set_value('voyage_flight_number', '');
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