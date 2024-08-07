// const mongoose = require('mongoose');



// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String
// });

// const register = mongoose.model('register', userSchema);

// module.exports = register;


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: String,
  favoriteMovie: String,
  favoriteCountry: String
});

// Middleware to encrypt sensitive fields
userSchema.pre('save', async function(next) {
  if (this.isModified('favoriteMovie')) {
    this.favoriteMovie = await bcrypt.hash(this.favoriteMovie, 10);
  }
  if (this.isModified('favoriteCountry')) {
    this.favoriteCountry = await bcrypt.hash(this.favoriteCountry, 10);
  }
  next();
});

const register = mongoose.model('registers', userSchema);

module.exports = register;