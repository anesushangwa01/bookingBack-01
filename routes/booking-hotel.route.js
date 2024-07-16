




const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const BookingApplication = require('../models/booking-hotel');
require('dotenv').config();

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send('User not authenticated');
};

// Endpoint to get all bookings
router.get('/', ensureAuthenticated ,async (req, res) => {
  try {
    const bookings = await BookingApplication.find({ user: req.user._id });
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).send('Error fetching bookings');
  }
});



// Endpoint to handle booking application and send email
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    console.log('Received booking request:', req.body);

    const applyBooking = new BookingApplication({
      ...req.body,
      user: req.user._id, // Associate booking with authenticated user
    });
    const savedBooking = await applyBooking.save();

    // Microsoft Outlook transporter configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your Microsoft account password
      },
    });

    // Send email
    const mailOptions = {
      from: `Booking Confirmation <${process.env.EMAIL_USER}>`,
      to: req.body.email,
      subject: 'Booking Confirmation',
      html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #0056b3;">Booking Confirmation</h1>
          <p>Hello ${req.body.firstName} ${req.body.lastName},</p>
          <p>Your booking details:</p>
          <h2>${req.body.hotelName}</h2>
          <ul>
            <li><strong>Check-in Date:</strong> ${req.body.checkInDate}</li>
            <li><strong>Check-out Date:</strong> ${req.body.checkOutDate}</li>
            <li><strong>Number of Guests:</strong> ${req.body.numberOfGuests}</li>
            <li><strong>Room Type:</strong> ${req.body.roomType}</li>
            <li><strong>Number of Rooms:</strong> ${req.body.numberOfRooms}</li>
            <li><strong>Special Requests:</strong> ${req.body.specialRequests}</li>
          </ul>
          <p>Thank you for booking with us!</p>
        </body>
      </html>
    `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Error sending email');
      }
      console.log('Email sent:', info.response);
      res.status(201).json(savedBooking);
    });

  } catch (err) {
    console.error('Error handling booking application:', err);
    res.status(400).send('Error handling booking application');
  }
});

module.exports = router;
