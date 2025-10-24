const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const { log } = require("console");
require("dotenv").config({ quiet: true });

passport.use(
  new GoogleStrategy(
    {
      clientID:process.env.GOOGLE_CLIENT_ID,
      clientSecret:process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
//         console.log('AccessToken:', accessToken);
//       console.log('RefreshToken:', refreshToken);
//       console.log('Profile:', profile);
// console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
// console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
// console.log("Google Callback URL:", process.env.GOOGLE_CALLBACK_URL);

      try {
        const email =profile.emails && profile.emails[0]? profile.emails[0].value : null;

        let user = null;

        if (email) {
          user = await User.findOne({ email });
        }
        // console.log( profile.id);
        
        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id;
          }
           user.isVerified = true;
            user.isGoogleUser= true,
            await user.save();
          return done(null, user);
        } else {
          const newUser = new User({
            name: profile.displayName,
            email: email,
            googleId: profile.id,
            isGoogleUser: true,
            isVerified: true,
          });
          await newUser.save();
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});



module.exports = passport;
