const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const config = require('./config.js');

const namesCollection = 'names';
const favouriteNamesCollection = 'favouriteNames';
const usersCollection = 'users';

async function getNames() {
    const client = new MongoClient(config.URL, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db()
            .collection(namesCollection)
            .findOne();
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

async function getFavouriteNames(username) {
    const client = new MongoClient(config.URL, {useUnifiedTopology: true});
    try {
        await client.connect();

        const response = await client.db()
            .collection(favouriteNamesCollection)
            .aggregate([
                { '$match': { 'username': username } },
                { '$project': { 'scores': [ { 'name': '$preferredName', 'score': 1 }, { 'name': '$unpreferredName', 'score': -1 } ] } },
                { '$unwind': { 'path': '$scores' } },
                { '$group': { '_id': '$scores.name', 'total': { $sum: '$scores.score' } } },
                { '$sort': { 'total': -1, '_id': 1 } },
                { '$project': { '_id': 0, 'total': 1, 'name': '$_id' } }
            ])
            .toArray();

        return response;
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

async function addFavouriteNames(preferredName, unpreferredName, username, date) {
    const client = new MongoClient(config.URL, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db()
            .collection(favouriteNamesCollection)
            .insertOne({
                preferredName, unpreferredName, username, date
            });
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

async function addName(name) {
    let { names } = await getNames();
    if (!names.includes(name))
        names.push(name);
    const client = new MongoClient(config.URL, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db()
            .collection(namesCollection)
            .findOneAndReplace({}, {names: names}, {returnOriginal: false});
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

async function deleteName(name) {
    let { names } = await getNames();
    const client = new MongoClient(config.URL, {useUnifiedTopology: true});
    try {
        await client.connect();
        await client.db()
            .collection(namesCollection)
            .findOneAndReplace({}, {names: names.filter(n => n !== name)});
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

async function getUsers() {
    const client = new MongoClient(config.URL, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db()
            .collection(usersCollection)
            .find()
            .project({username: 1, _id: 0})
            .toArray();
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

async function getUser(username) {
    if (!username) return null;
    const client = new MongoClient(config.URL, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db()
            .collection(usersCollection)
            .findOne({username: username});
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

async function getUserById(id) {
    if (!id) return null;
    const client = new MongoClient(config.URL, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db()
            .collection(usersCollection)
            .findOne({_id: ObjectId(id)});
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

async function addUser(username, password, isAdmin) {
    const client = new MongoClient(config.URL, {useUnifiedTopology: true});
    try {
        await client.connect();
        const userExists = await client.db()
            .collection(usersCollection)
            .findOne({username: username});
        if (!userExists) {
            await client.db()
                .collection(usersCollection)
                .insertOne({username, password, role: isAdmin ? config.userRoles.ADMIN : config.userRoles.USER});
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

async function validatePassword(userId, password) {
    if (!userId) return false;
    const client = new MongoClient(config.URL, {useUnifiedTopology: true});
    try {
        await client.connect();
        const user = await client.db()
            .collection(usersCollection)
            .findOne({_id: ObjectId(userId)});
        return await bcrypt.compare(password, user.password);
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        client.close();
    }
}

async function updatePassword(userId, hash) {
    if (!userId) return false;
    const client = new MongoClient(config.URL, {useUnifiedTopology: true});
    try {
        await client.connect();
        const user = await client.db()
            .collection(usersCollection)
            .updateOne(
                {_id: ObjectId(userId)},
                {$set: {password: hash}}
            );
        return true;
    } catch (err) {
        console.error(err);
        return false;
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
    getUsers,
    getUser,
    getUserById,
    updatePassword,
    validatePassword
}

