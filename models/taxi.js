const mongoose = require('mongoose');

const TaxiSchema = new mongoose.Schema({
  carType: { type: String, required: true },
  driverName: { type: String, required: true },
  hotelPartner: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
  // Additional driver-related fields (e.g., contact info) can be added
});

module.exports = mongoose.model('Taxi', TaxiSchema);
