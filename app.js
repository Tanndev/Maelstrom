const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');
const redisClient = require('./redis-client');

const Roll = require('./classes/Roll');

const app = express();

// Set up view engine and static assets.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'client/views'));
app.use(favicon(path.join(__dirname, 'client/static/icon8-favicon.ico')));
app.use(express.static(path.join(__dirname, 'client/static')));

// Set up logger and data parsers.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// Route client requests.
app.use(require('./client/router'));

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

app.get('/store/:key', async (req, res) => {
    const {key} = req.params;
    const value = req.query;
    await redisClient.setAsync(key, JSON.stringify(value));
    return res.send('Success');
});

app.get('/:key', async (req, res) => {
    const {key} = req.params;
    const rawData = await redisClient.getAsync(key);
    return res.json(JSON.parse(rawData));
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
