const mongoose = require('mongoose');


const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  photo1: { type: String, required: true },
  photo2: { type: String, required: true },
  photo3: { type: String, required: true },
  photo4: { type: String, required: true },
  photo5: { type: String, required: true },
  availableUnits: { type: Number, required: true },
  wifi: { type: Boolean, required: true },
  laundry: { type: Boolean, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
