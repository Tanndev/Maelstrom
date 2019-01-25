const createError = require('http-errors');
const express = require('express');
const favicon = require('serve-favicon');
const fs = require('fs');
const logger = require('morgan');
const path = require('path');

const sessionsMiddleware = require('./middleware/sessions');
const passport = require('./middleware/passport');

const Character = require('./classes/Character');
const Credentials = require('./classes/Credentials');
const Roll = require('./classes/Roll');
const User = require('./classes/User');

const app = express();

// Set up view engine and static assets.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'client/views'));
app.use(favicon(path.join(__dirname, 'client/static/images/icon8-favicon.ico')));
app.use(express.static(path.join(__dirname, 'client/static')));

// Set up logger and data parsers.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Load documentation and provide locals.
const documentation = require('./helpers/loadDocumentation');
app.use((req, res, next) => {
    res.locals.path = req.path;
    res.locals.availableDocumentation = Object.keys(documentation).sort();
    next();
});

// Enable sessions.
app.use(sessionsMiddleware);
app.use((req, res, next) => {
    if (!req.session) next(createError("No session established."));
    else next();
});

// Enable passport.
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Serve homepage.
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login',
    passport.authenticate('local', {failureRedirect: '/login'}),
    (req, res) => {
        res.redirect('/');
    }
);

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res, next) => {
    let requestedUser = req.body;

    // TODO Move validation to a more reasonable place.
    let errors = [];
    if (!requestedUser.username || typeof requestedUser.username !== 'string')
        errors.push(new Error('Username is a required field.'));
    if (!requestedUser.firstName || typeof requestedUser.firstName !== 'string')
        errors.push(new Error('First name is a required field.'));
    if (!requestedUser.lastName || typeof requestedUser.lastName !== 'string')
        errors.push(new Error('Last Name is a required field.'));
    if (!requestedUser.password || typeof requestedUser.password !== 'string')
        errors.push(new Error('Password is a required field.'));
    if (requestedUser.password !== requestedUser.confirmPassword)
        errors.push(new Error('Passwords must match.'));

    if (errors.length > 0){
        res.locals.formErrors = errors;
        res.render('register');
    }
    else {
        requestedUser.credentials = new Credentials(requestedUser);
        requestedUser.role = "User";
        let user = new User(requestedUser);
        req.login(user, error => {
            if (error) next(error);
            else res.redirect('/');
        })
    }
});

// Serve documentation.
app.get('/documentation', (req, res) => res.redirect('/'));
app.get('/documentation/:document', (req, res, next) => {
    let documentName = req.params.document;
    let document = documentation[documentName];
    if (document) {
        res.locals.document = document;
        if (req.app.settings.env === 'development') {
            document.reload().then(() => {
                res.render('documentation')
            });
        } else res.render('documentation');
    } else next();
});
app.use('/documentation', express.static(path.join(__dirname, 'documentation')));

// Serve character sheets.
app.get('/character/:id?', (req, res, next) => {
    let characterId = req.params.id || 'blank';
    fs.readFile(path.join(__dirname, 'characters', `${characterId}.json`), 'utf8', (error, contents) => {
        if (error) return next(createError(404));
        try {
            res.locals.character = new Character(JSON.parse(contents));
        } catch (error) {
            next(createError(error));
            return;
        }
        res.render('character-sheet');
        console.log(res.locals.character);
    });
});

// APIs
app.get('/roll', (req, res, next) => {
    try {
        let pool = parseInt(req.query.pool) || undefined;
        let difficulty = parseInt(req.query.difficulty) || undefined;
        let threshold = parseInt(req.query.threshold) || undefined;
        let specialty = req.query.hasOwnProperty('specialty');
        let roll = new Roll(pool, {difficulty, threshold, specialty});
        res.json(roll);
    } catch (error) {
        return next(createError(error));
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (error, req, res, next) {
    let {statusCode = 500, message, expose, stack} = error;
    res.locals.statusCode = statusCode;
    res.locals.message = message;
    if (expose || app.get('env') === 'development') res.locals.stack = stack.split(__dirname).join('maelstrom');
    res.status(statusCode).render('error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});

module.exports = app;
