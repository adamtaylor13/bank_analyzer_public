import mongo from 'mongodb';

const { MongoClient } = mongo;

const { DB_URI, DB_NAME } = process.env;

// Cached results
let _db;
let connection = null;

export const initDB = () => {
    return new Promise((resolve) => {
        MongoClient.connect(DB_URI, {useNewUrlParser: true})
            .then(connection => {
                _db = connection.db(DB_NAME);
                resolve();
            });
    });
};

export const getDB = () => {
    return _db;
};

const closeDB = () => {
    if (!connection) {
        console.log('Client is not available', connection);
    } else {
        connection.close(true, err => {
            console.log('err while closing?', err);
            const check = connection.isConnected();
            console.log('isOpen', check);
        });
    }
};


