const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  }).catch(err => done(err, null));
});

passport.use(
  new GoogleStrategy({
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: 'https://bookingback-01.onrender.com/auth/google/callback'
  }, (accessToken, refreshToken, profile, done) => {
    User.findOne({ googleId: profile.id }).then((existingUser) => {
      if (existingUser) {
        return done(null, existingUser);
      } else {
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }

        new User({
          googleId: profile.id,
          username: profile.displayName,
          thumbnail: profile._json.picture,
          email: email // Extract the email string correctly
        }).save().then((newUser) => {
          done(null, newUser);
        }).catch(err => done(err, null));
      }
    }).catch(err => done(err, null));
  })
);