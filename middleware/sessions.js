const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

const DEFAULT_SETTINGS = {
    name: "maelstrom",
    resave: false,
    saveUninitialized: false,
    secret: "Temporary Secret", // TODO Generate or load a secure secret.
    unset: 'destroy'
};

// Set up the middleware.
const client = redis.createClient({host: process.env['REDIS_HOST'], port: process.env['REDIS_PORT']});
const memorySessionMiddleware = session({...DEFAULT_SETTINGS});
const redisSessionMiddleware = session({store: new RedisStore({client}), ...DEFAULT_SETTINGS});
let currentMiddleware = memorySessionMiddleware;

// Switch between middleware on Redis client events.
client.on('ready', () => {
    console.log('Connected to Redis service.');
    currentMiddleware = redisSessionMiddleware;
});
client.on('end', () => {
    console.error("Redis service disconnected. Falling back to MemoryStore.");
    currentMiddleware = memorySessionMiddleware;
});

// Export a wrapper around the session middleware.
module.exports = (req, res, next) => {
    currentMiddleware(req, res, next);
};
