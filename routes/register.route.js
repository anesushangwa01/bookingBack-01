const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Account = require('../models/account-model');
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
            "Name": "Booking app"
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

router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

   

    // Check if a user with the same email already exists
    const existingUserByEmail = await UserBooking.findOne({ email });
    if (existingUserByEmail) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Check if a user with the same name already exists
    const existingUserByName = await UserBooking.findOne({ name });
    if (existingUserByName) {
      return res.status(409).json({ message: 'User with this name already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new UserBooking({
      name,
      email,
      password: hashedPassword,
   
    });

    // Save the user to the database
    const savedUser = await user.save();

    // Create an account for the user with a default amount
    const account = new Account({
      user: user._id, // Reference the user's ID
      amount: 3000 // Set the default balance
    });

    // Save the account to the database
    await account.save();

    // Respond with the saved user
    res.status(201).json(savedUser);

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});



module.exports = router;
