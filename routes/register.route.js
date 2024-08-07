// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcrypt');
// const  UserBooking = require('../models/register');

// router.post('/', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     const existingUserByEmail = await UserBooking.findOne({ email });
//     if (existingUserByEmail) {
//       return res.status(409).json({ message: 'User with this email already exists' });
//     }

//     const existingUserByName = await UserBooking.findOne({ name });
//     if (existingUserByName) {
//       return res.status(409).json({ message: 'User with this name already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new UserBooking({
//       name,
//       email,
//       password: hashedPassword
//     });

//     const savedUser = await user.save();
//     res.status(201).json(savedUser);
//   } catch (error) {
//     console.error('Error registering user:', error);
//     res.status(500).json({ message: 'Error registering user', error: error.message });
//   }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const UserBooking = require('../models/register');

router.post('/', async (req, res) => {
  try {
    const { name, email, password, favoriteMovie, favoriteCountry } = req.body;

    if (!name || !email || !password || !favoriteMovie || !favoriteCountry) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUserByEmail = await UserBooking.findOne({ email });
    if (existingUserByEmail) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const existingUserByName = await UserBooking.findOne({ name });
    if (existingUserByName) {
      return res.status(409).json({ message: 'User with this name already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserBooking({
      name,
      email,
      password: hashedPassword,
      favoriteMovie,
      favoriteCountry
    });

    const savedUser = await user.save();
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