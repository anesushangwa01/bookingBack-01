// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// // Schema for booking applications
// const BookingApplicationSchema = new Schema({
 
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   hotelName:{type: String},
//   email: { type: String, required: true },
//   checkInDate: { type: Date, required: true },
//   checkOutDate: { type: Date, required: true },
//   numberOfGuests: { type: Number, required: true },
//   roomType: { type: String, enum: ['single', 'double', 'suite'], required: true },
//   numberOfRooms: { type: Number, required: true },
//   specialRequests: { type: String }
// });


// const BookingApplication = mongoose.model('BookingApplication', BookingApplicationSchema);
// module.exports = BookingApplication;








const mongoose = require('mongoose');
const Schema = mongoose.Schema;



// Schema for booking applications
const BookingApplicationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'register',  required: true},
  firstName: { type: String },
  lastName: { type: String },
  hotelName: { type: String },
  email: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  numberOfGuests: { type: Number, required: true },
  roomType: { type: String, enum: ['single', 'double', 'suite'], required: true },

  specialRequests: { type: String }
});

const BookingApplication = mongoose.model('BookingApplication', BookingApplicationSchema);
module.exports = BookingApplication;
