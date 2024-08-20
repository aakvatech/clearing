from frappe import _

def get_data():
    return {
        "fieldname": "name",  # Primary field for linking
        "non_standard_fieldnames": {
            "TRA Clearance": "clearing_file",
            "Physical Verification": "clearing_file",
            "Shipment Clearance": "clearing_file",
            "Port Clearance": "clearing_file",
            "Clearing Document": "clearing_file"
        },
        "internal_links": {
            "Customer": "customer",
            "Shipping Line": "carrier_name",
            "Airplane": "airplane",
        
        },
        # "internal_and_external_links": {
        #     "Customs Clearance": ["customs_clearance", "clearing_file"],
        #     "Physical Verification Booking": ["physical_verification_booking", "clearing_file"],
        #     "Shipment Clearance": ["shipment_clearance", "clearing_file"],
        #     "Port Clearance": ["port_clearance", "clearing_file"],
        # },
        "transactions": [
            {
                "label": _("Clearance Processes"),
                "items": [
                    "TRA Clearance",
                    "Physical Verification Booking",
                    "Shipment Clearance",
                    "Port Clearance",
                ],
            },
            {
                "label": _("Stakeholders"),
                "items": [
                    "Customer",
                ],
            },
            {
                "label": _("Attached Documents"),
                "items": [
                    "Clearing Document",
                ],
            },
            {
                "label": _("Shipping and Airline Details"),
                "items": [
                    "Shipping Line",
                    "Airline",
                ],
            },
        ],
    }
