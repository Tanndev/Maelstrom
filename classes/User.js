const crypto = require('crypto');

const DataStore = require('./DataStore');
const datastore = new DataStore('users');

/**
 * Stores {@link User#firstName} values.
 * @type {WeakMap<User, string>}
 */
const firstNames = new WeakMap();

/**
 * Stores {@link User#lastName} values.
 * @type {WeakMap<User, string>}
 */
const lastNames = new WeakMap();
/**
 * Stores {@link User#credentials} values.
 * @type {WeakMap<User, Credentials>}
 */
const credentials = new WeakMap();

/**
 * Stores {@link User#role} values.
 * @type {WeakMap<User, string>}
 */
const roles = new WeakMap();

class User {
    /**
     * Finds a user account matching the given username. If available.
     * @param username
     * @returns {Promise<User>}
     */
    static findByUsername(username) {
        // TODO Look up via a view.
        return datastore.get(username)
            .then(document => {
                return new User(document);
            })
            .catch(error => {
                console.error(error);
                return null;
            })
    }

    constructor({firstName, lastName, role, credentials}) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.credentials = new Credentials(credentials);
        this.role = role;
    }

    /**
     * The user's first name.
     */
    get firstName() {
        return firstNames.get(this) || '';
    }

    set firstName(firstName) {
        if (!firstName || typeof firstName !== 'string') throw new Error('User.firstName must be a non-empty string.');
        firstNames.set(this, firstName);
    }

    /**
     * The user's last name.
     * @return {string}
     */
    get lastName() {
        return lastNames.get(this) || '';
    }

    set lastName(lastName) {
        if (!lastName || typeof lastName !== 'string') throw new Error('User.lastName must be a non-empty string.');
        lastNames.set(this, lastName);
    }

    /**
     * The user's role(s).
     * @return {string|string[]}
     */
    get role() {
        return roles.get(this) || 'User';
    }

    set role(role) {
        // TODO Implement some type of access control.
        if (!role || typeof role !== 'string') throw new Error('User.role must be a non-empty string.');
        roles.set(this, role);
    }

    /**
     * The user's credentials.
     * @return {Credentials}
     */
    get credentials() {
        return credentials.get(this);
    }

    set credentials(credentials) {
        if (!credentials || typeof credentials !== 'object') throw new Error('User.username must be an object.');
        credentials.set(this, credentials);
    }

    verifyCredentials(username, password) {
        // TODO DON'T DO THIS! Store a salted hash instead.
        return this.credentials.verify(username, password);
    }

}

class Credentials {
    static generate(username, password) {
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
        if (this.username.toLowerCase() === username.toLowerCase()) return false;

        // Hash the provided password and compare it.
        return Credentials.calculateHash(password, this.salt) === this.hash;
    }
}

module.exports = User;
