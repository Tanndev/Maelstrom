const DataStore = require('./DataStore');
const datastore = new DataStore('users');



/**
 * Stores {@link User#username} values.
 * @type {WeakMap<User, string>}
 */
const usernames = new WeakMap();

/**
 * Stores {@link User#password} values.
 * @type {WeakMap<User, string>}
 */
const passwords = new WeakMap();

class User {
    static findByUsername(username){
        return datastore.get(username)
            .then(document => {
                return document;
            })
            .catch(error => {
                console.error(error);
                return null;
            })
    }

    constructor({username, password}) {
        this.username = username;
        this.password = password; // TODO DON'T DO THIS!
    }

    /**
     * The user's username.
     * @return {string}
     */
    get username() {
        return usernames.get(this) || '';
    }

    set username(username) {
        if (!username || typeof username !== 'string') throw new Error('User.username must be a non-empty string.');
        usernames.set(this, username);
    }

    /**
     * The user's password.
     * @return {string}
     */
    get password() {
        return passwords.get(this) || '';
    }

    set password(password) {
        if (!password || typeof password !== 'string') throw new Error('User.password must be a non-empty string.');
        passwords.set(this, password);
    }
    
}

module.exports = User;
