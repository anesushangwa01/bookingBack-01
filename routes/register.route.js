const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const  UserBooking = require('../models/register');

router.post('/', async (req, res) => {
  try {
    // Example validation: Check for missing fields
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new UserBooking({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });

    // Save the user to the database
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error registering user:', error); // Log the error for debugging
    res.status(400).json({ message: 'Error registering user', error });
  } 
});


module.exports = router;