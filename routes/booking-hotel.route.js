const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const BookingApplication = require('../models/booking-hotel');
const User = require('../models/user'); 
const authenticateToken = require('../middleware/jwt');

require('dotenv').config();

router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Received booking request:', req.body);

    // Ensure the user is authenticated and their ID is available
    if (!req.user || !req.user.userId) {
      return res.status(401).send('User not authenticated');
    }

    // Create a new booking application with the authenticated user's ID
    const applyBooking = new BookingApplication({
      ...req.body,
      user: req.user.userId, // Use 'user' to match schema
    });

    const savedBooking = await applyBooking.save();

    // Send the saved booking as a response
    res.status(201).json(savedBooking);

  } catch (err) {
    console.error('Error handling booking application:', err);
    res.status(400).send('Error handling booking application');
  }
});


router.get('/', authenticateToken, async (req, res) => {
  try {
    // Log the user ID for debugging
    console.log('Request user ID:', req.user.userId);

    // Fetch bookings for the authenticated user
    const bookings = await BookingApplication.find({ user: req.user.userId }).exec();

    // Check if bookings exist for the user
    if (!bookings || bookings.length === 0) {
      return res.status(404).send('No bookings found');
    }

    // Respond with the user's bookings
    res.json(bookings);
  } catch (err) {
    // Log the error for debugging purposes
    console.error('Error fetching bookings:', err);

    // Respond with a 500 status code for internal server error
    res.status(500).send('Internal server error');
  }
});


// router.get('/', authenticateToken, async (req, res) => {
//   try {
//     const bookings = await BookingApplication.find({ user: req.user._id }).exec();
//     if (!bookings || bookings.length === 0) {
//       return res.status(404).send('No bookings found');
//     }
//     res.json(bookings);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

module.exports = router;
