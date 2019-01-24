// TODO Add database authentication instead of relying in an Admin party.
const nano = require('nano')(process.env.COUCH_URL || "http://localhost:5984");


class Datastore {
    constructor(name) {
        if (!name || typeof name !== 'string') throw new Error("Datastore.name must be a non-empty string.");
        // TODO Validate the input more.

        this._name = name;
        this._database = nano.use(name);
        this._readyPromise = this.initialize();
    }

    get name() {return this._name;}

    get nanodb() {return this._database;}

    get get() {return this._database.get;}

    get head() {return this._database.head;}

    get insert() {return this._database.insert;}

    get list() {return this._database.list;}

    initialize() {
        return nano.db.list()
            .then(existingDatabases => {
                if (!existingDatabases.includes(this._name)) {
                    return nano.db.create(this._name).then(() => {
                        console.log(`Created ${this._name} database.`);
                    })
                }
            })
            .then(() => {
                console.log(`Initialized connection to ${this._name} database.`);
            })
            .catch(error => {
                console.error(`Failed to connect to ${this._name} database.`);
                console.error(error);
            });
    }

    get waitForReady() {
        return this._readyPromise;
    }
}

module.exports = Datastore;
