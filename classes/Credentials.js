const crypto = require('crypto');

class Credentials {
    static generate({username, password}) {
        // Get a new salt.
        let salt = Credentials.getRandomSalt();

        // Calculate the hash.
        let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);

        // Create a new credential object.
        return new Credentials({username, salt, hash});
    }

    static getRandomSalt() {
        return crypto.randomBytes(16).toString('hex');
    }

    static calculateHash(password, salt){
        // TODO Validate inputs.
        return crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
    }

    constructor({username, salt, hash}) {
        /**
         * The username.
         * TODO Validate input.
         * @type {string}
         */
        this.username = username;

        /**
         * The salt used for the password hash.
         * TODO Validate input.
         * @type {string}
         */
        this.salt = salt;

        /**
         * The salted and hashed password.
         * TODO Validate input.
         * @type {string}
         */
        this.hash = hash;

        // Credentials objects cannot be changed after they are created.
        Object.freeze(this);
    }

    verify(username, password) {
        // If the username or password isn't a string, reject them.
        if (typeof username !== 'string' || typeof password !== 'string') return false;

        // If the username doesn't match, reject it.
        if (this.username.toLowerCase() !== username.toLowerCase()) return false;

        // Hash the provided password and compare it.
        return Credentials.calculateHash(password, this.salt) === this.hash;
    }
}

module.exports = Credentials;
