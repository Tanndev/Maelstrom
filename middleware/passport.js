const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new LocalStrategy((username, password, callback) => {
    // TODO Authenticate from a database
    if (password === 'password') callback(null, {id: username});
    else callback(null, false);
}));
passport.serializeUser((user, callback) => {
    callback(null, user.id);
});

passport.deserializeUser((id, callback) => {
    callback(null, {id});
});

module.exports = passport;
