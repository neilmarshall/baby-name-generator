const { addFavouriteNames, addName, deleteName, getFavouriteNames, getNames } = require('./names-repository.js');
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
app.post('/api/names/:name', async (req, res) => {
    const obj = await addName(req.params.name);
    res.status(201).send(obj);
});

app.post('/api/favouritenames', async (req, res) => {
    const obj = await addFavouriteNames(
        req.body.preferredName,
        req.body.unpreferredName,
        req.body.username,
        new Date());
    res.status(201).send(obj);
});

// DELETE
app.delete('/api/names/:name', async (req, res) => {
    await deleteName(req.params.name);
    res.status(204).send();
});

const port = process.env.PORT || 3000;
app.listen(port)
