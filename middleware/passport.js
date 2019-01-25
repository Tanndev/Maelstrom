const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../classes/User');

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new LocalStrategy((username, password, callback) => {
    User.findByUsername(username)
        .then(user => {
            if (user){
                if (user.verifyCredentials(username, password)) callback(null, user);
                else callback(null, false);
            }
            else callback(null, false);
        })
        .catch(error => {
            callback(error);
        });
}));
passport.serializeUser((user, callback) => {
    // TODO Do this better, as per deserializeUser.
    callback(null, user.credentials.username);
});

passport.deserializeUser((username, callback) => {
    // TODO Find by session ID or other, more secure option.
    User.findByUsername(username)
        .then(user => {
            if (user) callback(null, user);
            else callback(null, false);
        })
        .catch(error => {
            callback(error);
        });
});

module.exports = passport;
