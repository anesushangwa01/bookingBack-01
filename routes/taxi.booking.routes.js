const express = require('express');
const router = express.Router();
const Taxi = require('../models/taxi');
const TaxiBooking = require('../models/taxi.booking');
const authenticateToken = require('../middleware/jwt');
const isAdmin = require('../middleware/admin.jwt');

// Admin route to add taxi
router.post('/addTaxi' , authenticateToken, isAdmin, async (req, res) => {
  try {
    const taxi = new Taxi(req.body);
    await taxi.save();
    res.status(201).json(taxi);
  } catch (error) {
    res.status(500).json({ message: 'Error adding taxi', error });
  }
});

// Get available taxis (not booked)
router.get('/availableTaxis', async (req, res) => {
  try {
    const taxis = await Taxi.find({ isBooked: false });
    res.json(taxis);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching taxis', error });
  }
});

router.get('/all' , authenticateToken, async (req, res) => {
  try {
    const bookings = await  Taxi.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Book a taxi (POST /bookTaxi)
router.post('/bookTaxi', authenticateToken, async (req, res) => {
  try {
    const { fromLocation, toLocation, pickupTime, taxiId, userId } = req.body;

    // Check if the taxi is available (not booked)
    const taxi = await Taxi.findById(taxiId);
    if (!taxi || taxi.isBooked) {
      return res.status(400).json({ error: 'Taxi is unavailable' });
    }

    // Create the booking
    const booking = new TaxiBooking({
      taxi: taxiId,
      fromLocation,
      toLocation,
      pickupTime,
      user: userId
    });

    await booking.save();

    // Mark the taxi as booked
    taxi.isBooked = true;
    await taxi.save();

    res.status(200).json({ message: 'Taxi booked successfully', booking });
  } catch (err) {
    res.status(500).json({ error: 'Error booking taxi' });
  }
});

module.exports = router;
