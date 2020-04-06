const { MongoClient, ObjectId } = require('mongodb');
const url = require('./config.js').URL;
const namesCollection = 'names';
const favouriteNamesCollection = 'favouriteNames';
const usersCollection = 'users';

async function getNames() {
    const client = new MongoClient(url, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db()
            .collection(namesCollection)
            .findOne();
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function getFavouriteNames(username) {
    const client = new MongoClient(url, {useUnifiedTopology: true});
    try {
        await client.connect();

        const preferredNames = await client.db()
            .collection(favouriteNamesCollection)
            .aggregate([
                { '$match': { 'username': username } },
                { '$group': { '_id': '$preferredName', 'count': { $sum: 1 } } }
            ])
            .toArray();

        const unpreferredNames = await client.db()
            .collection(favouriteNamesCollection)
            .aggregate([
                { '$match': { 'username': username } },
                { '$group': { '_id': '$unpreferredName', 'count': { $sum: -1 } } }
            ])
            .toArray();

        const nameCounts = {};
        for (let [_, {_id, count}] of Object.entries(preferredNames)) {
            nameCounts[_id] = count;
        };
        for (let [_, {_id, count}] of Object.entries(unpreferredNames)) {
            if (nameCounts[_id]) {
                nameCounts[_id] += count;
            } else {
                nameCounts[_id] = count;
            }
        };

        const sortedNames = Object.keys(nameCounts)
            .sort((n1, n2) =>
                nameCounts[n1] === nameCounts[n2]
                    ? n1 < n2 ? -1 : 1
                    : nameCounts[n1] > nameCounts[n2] ? -1 : 1
            );

        return sortedNames.map(name => { return {name, total: nameCounts[name]}; });
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function addFavouriteNames(preferredName, unpreferredName, username, date) {
    const client = new MongoClient(url, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db()
            .collection(favouriteNamesCollection)
            .insertOne({
                preferredName, unpreferredName, username, date
            });
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function addName(name) {
    let { names } = await getNames();
    if (!names.includes(name))
        names.push(name);
    const client = new MongoClient(url, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db()
            .collection(namesCollection)
            .findOneAndReplace({}, {names: names}, {returnOriginal: false});
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function deleteName(name) {
    let { names } = await getNames();
    const client = new MongoClient(url, {useUnifiedTopology: true});
    try {
        await client.connect();
        await client.db()
            .collection(namesCollection)
            .findOneAndReplace({}, {names: names.filter(n => n !== name)});
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function getUser(username) {
    if (!username) return null;
    const client = new MongoClient(url, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db()
            .collection(usersCollection)
            .findOne({username: username});
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function getUserById(id) {
    if (!id) return null;
    const client = new MongoClient(url, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db()
            .collection(usersCollection)
            .findOne({_id: ObjectId(id)});
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

async function addUser(username, password) {
    const client = new MongoClient(url, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db()
            .collection(usersCollection)
            .insertOne({username, password});
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

module.exports = {
    addFavouriteNames,
    addName,
    addUser,
    deleteName,
    getFavouriteNames,
    getNames,
    getUser,
    getUserById
}

