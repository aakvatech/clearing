// bench/apps/av_freight/realtime/handlers.js

function ais_stream_handler(socket) {
    // Handle 'PositionReport' event from AIS Stream
    socket.on('PositionReport', (aisMessage) => {
        if (aisMessage.MessageType === "PositionReport") {
            let positionReport = aisMessage.Message.PositionReport;
            console.log(
                `ShipId: ${positionReport.UserID} Latitude: ${positionReport.Latitude} Longitude: ${positionReport.Longitude}`
            );

            // Publish real-time event to Frappe
            frappe.realtime.publish('ship_position_update', {
                ship_id: positionReport.UserID,
                latitude: positionReport.Latitude,
                longitude: positionReport.Longitude
            });
        }
    });

    // You can add more event handlers here if needed
}

module.exports = ais_stream_handler;
