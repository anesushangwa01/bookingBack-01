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

    // Microsoft Outlook transporter configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
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
            <li><strong>Check-in Date:</strong> ${new Date(req.body.checkInDate).toLocaleDateString()}</li>
            <li><strong>Check-out Date:</strong> ${new Date(req.body.checkOutDate).toLocaleDateString()}</li>
            <li><strong>Number of Guests:</strong> ${req.body.numberOfGuests}</li>
            <li><strong>Room Type:</strong> ${req.body.roomType}</li>
            <li><strong>Number of Rooms:</strong> ${req.body.numberOfRooms}</li>
            <li><strong>Special Requests:</strong> ${req.body.specialRequests || 'None'}</li>
          </ul>
          <p>Thank you for booking with us!</p>
        </body>
      </html>
    `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send(`Error sending email: ${error.message}`);
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
