const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: "870192099821-44fnd7tog3f21506vn4k59bsejb92rb5.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: 'http://localhost:8082/auth/google/callback' // Replace with your app's callback URL
}, (accessToken, refreshToken, profile, done) => {
    // Save user information or perform other necessary actions
    console.log(profile)
    return done(null, profile);
}));