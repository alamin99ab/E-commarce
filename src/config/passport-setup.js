const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user.model');

// --- Google OAuth2 Strategy ---
passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/v1/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Find if a user already exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                return done(null, user); // User exists, log them in
            }

            // If not, check if they exist with the same email
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
                // Link the Google ID to the existing account
                user.googleId = profile.id;
                user.isVerified = true;
                await user.save();
                return done(null, user);
            }

            // Otherwise, create a new user
            const newUser = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                isVerified: true, // Google emails are considered verified
            });
            return done(null, newUser);

        } catch (error) {
            return done(error, false);
        }
    })
);

// --- JSON Web Token (JWT) Strategy ---
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(
    new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.id).select('-password');
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

// Passport serialization/deserialization (for session-based auth if needed, though we primarily use JWT)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});