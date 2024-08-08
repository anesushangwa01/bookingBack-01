const express = require('express');
const router = express.Router();
const  Booking = require('../models/bookig-model');


router.get('/', async (req, res) => {
    try {
      const bookings = await  Booking.find();
      res.json(bookings);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  
  router.post('/', async (req, res) => {
    try {
      const existingBooking = await Booking.findOne({ name: req.body.name });
      if (existingBooking) {
        return res.status(400).json({ message: 'Hotel name already exists.' });
      }
  
      const newBooking = new Booking(req.body);
      const savedBooking = await newBooking.save();
      res.status(201).json(savedBooking);
    } catch (err) {
      res.status(400).json({ message: err.message }); // Send the error message to the frontend
    }
  });

  
  router.get('/:id', async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).send('Booking not found');
      }
      res.json(booking);
    } catch (err) {
      res.status(500).send(err);
    }
  });
  

module.exports = router;