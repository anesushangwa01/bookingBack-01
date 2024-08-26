
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token provided

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.sendStatus(403); // Token invalid
    }

    req.user = user;

    // Check if the user is an admin
    if (req.user.email === process.env.ADMIN_EMAIL) {
      req.user.isAdmin = true;
    } else {
      req.user.isAdmin = false;
    }

    next();
  });
}

module.exports = authenticateToken;
