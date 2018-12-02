const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const express = require('express');
const fs = require('fs');
const logger = require('morgan');
const Marked = require('marked');
const path = require('path');
const redisClient = require('./redis-client');

const Roll = require('./classes/Roll');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const rules = Marked(fs.readFileSync(path.join(__dirname, 'documentation', 'rules.md'), 'utf8'));
const lore = Marked(fs.readFileSync(path.join(__dirname, 'documentation', 'lore.md'), 'utf8'));
app.get('/documentation/rules', (req, res) => {res.send(rules)});
app.get('/documentation/lore', (req, res) => {res.send(lore)});
app.use('/documentation', express.static(path.join(__dirname, 'documentation')));

app.get('/', (req, res) => {
    res.send("Hi there! I'm a fancy server!");
});

app.get('/roll', (req, res, next) => {
    try {
        let pool = parseInt(req.query.pool) || undefined;
        let difficulty = parseInt(req.query.difficulty) || undefined;
        let threshold = parseInt(req.query.threshold) || undefined;
        let specialty = req.query.hasOwnProperty('specialty');
        let roll = new Roll({pool, difficulty, threshold, specialty});
        res.json(roll);
    }
    catch (error) {
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
    let {status = 500, message, stack} = error;
    res.status(status);
    if (error.expose || app.get('env') === 'development') res.send(`(Error ${status}) ${message}.`);
    else res.send(`(Error ${status}) An error occurred.`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});

module.exports = app;
