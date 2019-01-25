const Credentials = require('./Credentials');
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

    set credentials(value) {
        if (!value || !(value instanceof Credentials)) throw new Error('User.credentials must be a Credentials object.');
        credentials.set(this, value);
    }

    verifyCredentials(username, password) {
        // TODO DON'T DO THIS! Store a salted hash instead.
        return this.credentials.verify(username, password);
    }

}

module.exports = User;
