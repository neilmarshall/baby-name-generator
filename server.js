const { getNames, getFavouriteNames, addFavouriteNames } = require('./names-repository.js');
const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// GET
app.get('/', (req, res) => {
    res.send();
});

app.get('/api/names', async (req, res) => {
    res.send(await getNames());
});

app.get('/api/favouritenames/:username', async (req, res) => {
    const username = req.params.username;
    res.send(await getFavouriteNames(username));
});

// POST
app.post('/api/favouritenames', async (req, res) => {
    addFavouriteNames(
        req.body.preferredName,
        req.body.unpreferredName,
        req.body.username);
    res.status(201).send();
});

const port = process.env.PORT || 3000;
app.listen(port)
