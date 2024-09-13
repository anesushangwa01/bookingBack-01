
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaxiBookingSchema = new mongoose.Schema({
  taxi: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxi', required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  pickupTime: { type: Date,},
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('TaxiBooking', TaxiBookingSchema);
