

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const UserBooking = require('../models/register');
const Account = require('../models/account-model')

router.post('/', async (req, res) => {
  try {
    const { name, email, password, favoriteMovie, favoriteCountry } = req.body;

    // Check for missing fields
    if (!name || !email || !password || !favoriteMovie || !favoriteCountry) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if a user with the same email already exists
    const existingUserByEmail = await UserBooking.findOne({ email });
    if (existingUserByEmail) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Check if a user with the same name already exists
    const existingUserByName = await UserBooking.findOne({ name });
    if (existingUserByName) {
      return res.status(409).json({ message: 'User with this name already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new UserBooking({
      name,
      email,
      password: hashedPassword,
      favoriteMovie,
      favoriteCountry
    });

    // Save the user to the database
    const savedUser = await user.save();

    // Create an account for the user with a default amount
    const account = new Account({
      user: user._id, // Reference the user's ID
      amount: 3000 // Set the default balance
    });

    // Save the account to the database
    await account.save();

    // Respond with the saved user
    res.status(201).json(savedUser);

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});


router.post('/reset-password', async (req, res) => {
  try {
    const { email, favoriteMovie, favoriteCountry, newPassword } = req.body;

    if (!email || !favoriteMovie || !favoriteCountry || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await UserBooking.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMovieMatch = await bcrypt.compare(favoriteMovie, user.favoriteMovie);
    const isCountryMatch = await bcrypt.compare(favoriteCountry, user.favoriteCountry);

    if (!isMovieMatch || !isCountryMatch) {
      return res.status(403).json({ message: 'Incorrect security answers' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password successfully reset' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

module.exports = router;

module.exports = router;