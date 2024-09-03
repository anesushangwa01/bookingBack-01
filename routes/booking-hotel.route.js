const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const BookingApplication = require('../models/booking-hotel');
const User = require('../models/user'); 
const authenticateToken = require('../middleware/jwt');
const Account = require('../models/account-model')



require('dotenv').config();

// router.post('/', authenticateToken, async (req, res) => {
//   try {
//     console.log('Received booking request:', req.body);

//     // Ensure the user is authenticated and their ID is available
//     if (!req.user || !req.user.userId) {
//       return res.status(401).send('User not authenticated');
//     }

//     // Create a new booking application with the authenticated user's ID
//     const applyBooking = new BookingApplication({
//       ...req.body,
//       user: req.user.userId,
//     });

//     const savedBooking = await applyBooking.save();

//     // Send the saved booking as a response
//     res.status(201).json(savedBooking);

//   } catch (err) {
//     console.error('Error handling booking application:', err);
//     res.status(400).send('Error handling booking application');
//   }
// });



/// Room type costs
const roomCosts = {
  single: 100,
  double: 200,
  suite: 400
};

// Cost per additional guest
const guestCost = 100;

// Per-day cost
const perDayCost = 100;

// POST route to apply for a booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { roomType, numberOfGuests, checkInDate, checkOutDate } = req.body;

    // Find the user's account
    const account = await Account.findOne({ user: req.user.userId });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Validate room type
    const roomCost = roomCosts[roomType];
    if (!roomCost) {
      return res.status(400).json({ message: 'Invalid room type' });
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ message: 'Invalid dates' });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Calculate the number of days between check-in and check-out
    const timeDifference = checkOut.getTime() - checkIn.getTime();
    const numberOfDays = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convert milliseconds to days

    // Calculate the total cost
    const totalGuestCost = (numberOfGuests - 1) * guestCost; // First guest is included in the room cost
    const dateCost = numberOfDays * perDayCost; // Per-day cost based on the number of days
    const totalCost = roomCost + totalGuestCost + dateCost; // Total cost including room, guests, and per-day cost

    // Check if the user has sufficient funds
    if (account.amount < totalCost) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Deduct the total cost from the user's account balance
    account.amount -= totalCost;
    await account.save();

    // Create the booking application
    const bookingApplication = new BookingApplication({
      ...req.body,
      user: req.user.userId,
      totalCost,
      numberOfDays
    });
    await bookingApplication.save();

    res.status(201).json({ 
      message: 'Booking application submitted successfully', 
      bookingApplication,
      calculatedTotalCost: totalCost 
    });
  } catch (error) {
    console.error('Error applying for booking:', error);
    res.status(500).json({ message: 'Error applying for booking', error: error.message });
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
