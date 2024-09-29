const express = require('express');
const router = express.Router();
const Taxi = require('../models/taxi');
const TaxiBooking = require('../models/taxi.booking');
const authenticateToken = require('../middleware/jwt');
const isAdmin = require('../middleware/admin.jwt');

// Admin route to add taxi
router.post('/addTaxi' , authenticateToken, async (req, res) => {
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
    const taxis = await Taxi.find();
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

    // Extract the driver name and car type from the taxi object
    const { driverName, carType } = taxi;

    // Create the booking with the required fields, including driverName and carType
    const booking = new TaxiBooking({
      taxi: taxiId,
      fromLocation,
      toLocation,
      pickupTime,
      user: userId,
      driverName,   // Add the driverName to the booking
      carType       // Add the carType to the booking
    });

    await booking.save();

    // Mark the taxi as booked
    taxi.isBooked = true;
    await taxi.save();

    res.status(200).json({ message: 'Taxi booked successfully', booking });
  } catch (err) {
    console.error('Error booking taxi:', err);
    res.status(500).json({ error: 'Error booking taxi' });
  }
});



router.get('/booked', authenticateToken, async (req, res) => {
  try {
    // Log the user ID for debugging
    console.log('Request user ID:', req.user.userId);

    // Fetch bookings for the authenticated user
    const bookings = await TaxiBooking.find({ user: req.user.userId })
      .populate('taxi')
      .populate('user')
      .exec();

    // Check if bookings exist for the user
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ error: 'No bookings found' });
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


module.exports = router;
