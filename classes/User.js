const util = require('util');
const uuid = require('uuid');

const Credentials = require('./Credentials');
const DataStore = require('./DataStore');
const datastore = new DataStore('users');

/**
 * Stores {@link User#_id} values.
 * @type {WeakMap<User, string>}
 */
const ids = new WeakMap();

/**
 * Stores {@link User#_rev} values.
 * @type {WeakMap<User, string>}
 */
const revs = new WeakMap();
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

class User {
    /**
     * Finds a user account matching the given ID. If available.
     * @param {string} id
     * @returns {Promise<User>}
     */
    static findByID(id) {
        return datastore.get(id)
            .then(document => {
                return new User(document);
            })
            .catch(error => {
                console.error(error);
                return null;
            })
    }

    /**
     * Finds a user account matching the given username. If available.
     * @param {string} username
     * @returns {Promise<User>}
     */
    static findByUsername(username) {
        // TODO Look up via a view.
        return datastore.view('userLists', 'byUsername', {include_docs: true})
            .then(result => {
                if (!result || !result.rows || !result.rows.length) return null;
                if (result.rows.length > 1){
                    throw new Error(`More than one user has the username '${username}'. Contact an admin.`);
                }
                return new User(result.rows[0].doc);
            })
    }

    constructor({_id, _rev, firstName, lastName, credentials}) {
        this._id = _id || `user:${uuid()}`;
        if (_rev) this._rev = _rev;
        this.firstName = firstName;
        this.lastName = lastName;
        this.credentials = new Credentials(credentials);
    }

    /**
     * THe unique user ID.
     * @returns {string}
     */
    get _id() {
        return ids.get(this);
    }

    set _id(_id) {
        if (!_id || typeof _id !== 'string') throw new Error('User._id must be a non-empty string.');
        ids.set(this, _id);
    }

    /**
     * THe unique user rev.
     * @returns {string}
     */
    get _rev() {
        return revs.get(this);
    }

    set _rev(_rev) {
        if (!_rev || typeof _rev !== 'string') throw new Error('User._rev must be a non-empty string.');
        revs.set(this, _rev);
    }

    /**
     * The user's first name.
     */
    get firstName() {
        return firstNames.get(this);
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
        let credentials = this.credentials;
        return !!credentials && credentials.verify(username, password);
    }

    save() {
        return datastore.insert(this.toJSON())
            .then(({id, rev}) => {
                this._id = id;
                this._rev = rev;
            })
            .catch(error => {
                console.error(error);
                throw error;
            })
    }

    /**
     * Converts this user object to a generic object.
     * @return {object}
     */
    toJSON() {
        // noinspection JSUnusedLocalSymbols
        let {_id, firstName, lastName, credentials} = this;
        return {_id, firstName, lastName, credentials};
    }

    /**
     * Overrides the default util.inspect behavior to use {@link User#toJSON} instead.
     */
    [util.inspect.custom]() {
        return this.toJSON();
    }
}

module.exports = User;
