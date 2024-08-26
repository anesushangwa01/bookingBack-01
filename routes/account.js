
const express = require('express');
const router = express.Router();
const Account = require('../models/account-model');
const authenticateToken = require('../middleware/jwt');



// Get the account amount by user ID
// routes/account.js
// GET route to fetch the account amount for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Find the account associated with the authenticated user
    const account = await Account.findOne({ user: req.user.userId }).exec();

    // If no account is found, return a 404 error
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Return the account amount
    res.json({ amount: account.amount });
  } catch (error) {
    console.error('Error fetching account amount:', error);
    res.status(500).json({ message: 'Error fetching account amount', error: error.message });
  }
});



module.exports = router;
