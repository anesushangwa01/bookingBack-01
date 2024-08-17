function isAdmin(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
      return res.sendStatus(403); // Forbidden if not an admin
    }
    next();
  }
  
  module.exports = isAdmin;
  