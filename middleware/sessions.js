const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

let clientReady = false;

const client = redis.createClient({host: process.env['REDIS_HOST'], port: process.env['REDIS_PORT']});
client.on('ready', () => {
    clientReady = true;
});

module.exports = session({
    name: "maelstrom",
    resave: false,
    saveUninitialized: false,
    secret: "Temporary Secret", // TODO Generate or load a secure secret.
    store: new RedisStore({client, logErrors: true}),
    unset: 'destroy'
});
