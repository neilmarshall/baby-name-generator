const { MongoClient } = require('mongodb');

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/babynames';

async function getNames() {
    const client = new MongoClient(url, {useUnifiedTopology: true});
    try {
        await client.connect();
        return await client.db().collection('names').findOne();
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
            .collection('favouriteNames')
            .aggregate([
                { '$match': { 'username': username } },
                { '$group': { '_id': '$preferredName', 'count': { $sum: 1 } } }
            ])
            .toArray();

        const unpreferredNames = await client.db()
            .collection('favouriteNames')
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

async function addFavouriteNames(preferredName, unpreferredName, username) {
    const client = new MongoClient(url, {useUnifiedTopology: true});
    try {
        await client.connect();
        await client.db().collection('favouriteNames').insertOne({
            preferredName, unpreferredName, username
        });
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

module.exports = { getNames, getFavouriteNames, addFavouriteNames }

