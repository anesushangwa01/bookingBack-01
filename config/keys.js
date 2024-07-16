module.exports = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },
  session: {
    cookieKey: process.env.COOKIE_KEY // Ensure this matches the secret used in express-session
  }
};