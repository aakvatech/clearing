from frappe import _

def get_data():
    return {
        "fieldname": "name",  # Primary field for linking
        "non_standard_fieldnames": {
            "Customs Clearance": "clearing_file_number",
            "Physical Verification Booking": "clearing_file_number",
            "Shipment Clearance": "clearing_file",
            "Port Clearance": "clearing_file",
        },
        "internal_links": {
            "Customer": "customer",
            "Clearing Agent": "clearing_agent",
            "Shipping Line": "carrier_name",
            "Airline": "airline",
            "Airplane": "airplane",
            "Shipment Vessel": "voyage_flight_number",
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
                    "Customs Clearance",
                    "Physical Verification Booking",
                    "Shipment Clearance",
                    "Port Clearance",
                ],
            },
            {
                "label": _("Stakeholders"),
                "items": [
                    "Customer",
                    "Clearing Agent",
                ],
            },
            {
                "label": _("Shipping and Airline Details"),
                "items": [
                    "Shipping Line",
                    "Airline",
                    "Airplane",
                    "Shipment Vessel",
                ],
            },
        ],
    }
