const express = require('express');
const router = express.Router();
const Taxi = require('../models/taxi');
const TaxiBooking = require('../models/taxi.booking');
const authenticateToken = require('../middleware/jwt');

// Admin route to add taxi
router.post('/addTaxi', async (req, res) => {
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

// Book a taxi
// Book a taxi (POST /bookTaxi)
router.post('/bookTaxi', authenticateToken, async (req, res) => {
    try {
      const { fromLocation, toLocation, pickupTime, taxiId } = req.body;
      
      // Find the selected taxi
      const taxi = await Taxi.findById(taxiId);
      if (!taxi) {
        return res.status(404).json({ message: 'Taxi not found' });
      }
  
      // Check if taxi is available
      if (taxi.status !== 'available') {
        return res.status(400).json({ message: 'Taxi is not available' });
      }
  
      // Update taxi status to booked
      taxi.status = 'booked';
      await taxi.save();
  
      // Create the booking
      const booking = new TaxiBooking({
        fromLocation,
        toLocation,
        pickupTime,
        taxi: taxiId,
        user: req.user.userId // Assuming you're using token authentication and have the user ID
      });
      await booking.save();
  
      res.status(201).json({ message: 'Taxi booked successfully', booking });
    } catch (error) {
      res.status(500).json({ message: 'Error booking taxi', error: error.message });
    }
  });

module.exports = router;
