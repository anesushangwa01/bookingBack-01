require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const keys = require('./config/keys');
require('./config/passport-setup');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('Error: MONGODB_URI environment variable not set.');
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

// Express middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: 'https://booking02.netlify.app', // Allow only this origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true // Allow credentials
};

app.use(cors(corsOptions));

// Session middleware
app.use(session({
  secret: keys.session.cookieKey,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
const addBooking = require('./routes/booking-routes');
const applyBooking = require('./routes/booking-hotel.route');
const authRoutes = require('./routes/auth-routes');

app.use('/booking', addBooking);
app.use('/apply', applyBooking);
app.use('/auth', authRoutes);

app.get('/profile', (req, res) => {
  if (req.user) {
    res.send(`Welcome, ${req.user.username},${req.user.email}`);
  } else {
    res.redirect('/auth/login');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
