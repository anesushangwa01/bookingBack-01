const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: String,
  resetCode: { type: String } 
});

const register = mongoose.model('registers', userSchema);

module.exports = register;
