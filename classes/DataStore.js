// TODO Add database authentication instead of relying in an Admin party.
const nano = require('nano')(process.env.COUCH_URL || "http://localhost:5984");

const DATABASES = [
    "users",
    "characters",
];

// TODO Retry until success.
createDatabases()
    .then(() => {
        console.log('Data store is ready.')
    })
    .catch(() => {
        console.error('Unable to set up data store.');
    });

function createDatabases(){
    return nano.db.list()
        .then(existingDatabases => {
            let databasesToCreate = DATABASES.filter(database => !existingDatabases.includes(database));
            if (databasesToCreate){
                let creationPromises = databasesToCreate.map(database => {
                    return nano.db.create(database).then(() => {
                        console.log(`Created ${database} database.`);
                    })
                });
                return Promise.all(creationPromises);
            }
        })
        .then(() => {
            console.log('All databases set up and ready.');
        })
        .catch(error => {
            console.error(error);
        });
}
