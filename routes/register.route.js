const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const  UserBooking = require('../models/register');

router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
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
      password: hashedPassword
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

module.exports = router;