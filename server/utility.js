import util from 'util';
import mongo from 'mongodb';

/**
 * Pretty print a json object using util.inspect
 */
export const prettyPrint = response => {
    console.log('\n');
    console.log(util.inspect(response, {colors: true, depth: 4}));
};

export const prettyJson = json => {
    return util.inspect(json, { colors: true, depth: 4 });
    // return JSON.stringify(json, undefined, 2);
};

export const asyncForEach = async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};

export const getObjectID = doc => {
    const { ObjectID } = mongo;
    if (typeof doc === 'string') {
        return ObjectID(doc);
    }

    if (Object.keys(doc).includes('_bsontype')) {
        return ObjectID(doc.id);
    }

    let _id = doc._id;
    if (typeof _id === 'string') {
        return ObjectID(_id);
    } else {
        return _id;
    }
};

export const errorWrap = fn => (...args) => fn(...args).catch(args[2]);
