// models/account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'register', // Reference the Register model
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 3000, // Default amount for the account
  },
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
