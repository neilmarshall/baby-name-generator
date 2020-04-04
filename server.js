const { getNames, addNames } = require('./names-repository.js');
const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// GET
app.get('/', (req, res) => {
    res.send();
});

app.get('/api/favouritenames/:username', async (req, res) => {
    const username = req.params.username;
    res.send(await getNames(username));
});

// POST
app.post('/api/favouritenames', async (req, res) => {
    addNames(req.body.preferredName, req.body.unpreferredName);
    res.status(201).send();
});

const port = process.env.PORT || 3000;
app.listen(port)
