require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
require('./config/passport-setup');
const  Booking  = require('./models/register')
const authenticateToken  = require('./middleware/jwt');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET; 
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
  origin: 'https://bookingapk.netlify.app/', // Allow only this origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true // Allow credentials
};

app.use(cors(corsOptions));


// Routes
const addBooking = require('./routes/booking-routes');
const applyBooking = require('./routes/booking-hotel.route');
const authRoutes = require('./routes/auth-routes');
const reg = require('./routes/register.route');

app.use('/booking', addBooking);
app.use('/apply', applyBooking);
app.use('/auth', authRoutes);
app.use('/register', reg);





app.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: 'Email and password are required' });
    }

    const user = await Booking.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).send({ message: 'Login successful!', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send({ message: 'Error logging in', error });
  }
});




// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).send({ message: 'This is a protected route!' });
});



app.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await Booking.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send(user);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).send({ message: 'Error fetching user info', error });
  }
});




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
