const express = require('express');
const passport = require('passport');
const router = express.Router();

// Initiate Google authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle callback after Google has authenticated the user
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home or to the dashboard
    res.redirect('http://localhost:4200');
  }
);

router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
});

// Logout route
// router.get('/logout', (req, res, next) => {
//   req.logout((err) => {
//     if (err) {
//       return next(err);
//     }
//     res.redirect('http://localhost:4200/header');
//     console.log('logout')
//   });
// });

// Route for logging out
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to log out' });
    }
    res.status(200).json({ message: 'Successfully logged out' });
  });
});

module.exports = router;