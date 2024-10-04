const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const UserBooking = require('../models/register');
const mailjet = require('node-mailjet').apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);

router.post('/request-reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await UserBooking.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save the reset code to the user's document
    user.resetCode = resetCode;
    await user.save();

    // Send the reset code via Mailjet
    const request = mailjet
      .post("send", { 'version': 'v3.1' })
      .request({
        "Messages": [{
          "From": {
            "Email": "anesushangwa01@gmail.com",
            "Name": "Your App Name"
          },
          "To": [{
            "Email": user.email,
            "Name": user.name
          }],
          "Subject": "Password Reset Code",
          "TextPart": `Hello, your password reset code is: ${resetCode}`,
          "HTMLPart": `<p>Hello,</p><p>Your password reset code is: <strong>${resetCode}</strong></p>`
        }]
      });

    request.then(() => {
      res.status(200).json({ message: 'Reset code sent to email' });
    }).catch((err) => {
      console.error('Error sending email:', err);
      res.status(500).json({ message: 'Error sending reset code', error: err.message });
    });

  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Error requesting password reset', error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await UserBooking.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetCode !== resetCode) {
      return res.status(403).json({ message: 'Invalid reset code' });
    }

    // Hash the new password and update the user
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.resetCode = null; // Clear the reset code after successful reset
    await user.save();

    res.status(200).json({ message: 'Password successfully reset' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

module.exports = router;
