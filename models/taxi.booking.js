
const mongoose = require('mongoose');


const TaxiBookingSchema = new mongoose.Schema({
  taxi: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxi', required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  pickupTime: { type: Date,},
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverName: { type: String, required: true }, // Add driver name
  carType: { type: String, required: true },    // Add car type
});

module.exports = mongoose.model('TaxiBooking', TaxiBookingSchema);
