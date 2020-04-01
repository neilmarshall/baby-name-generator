const express = require('express');
const app = express();
const {names} = require('./names.json');

app.use(express.static('public'));

// GET
app.get('/', (req, res) => {
    res.send();
});

const port = process.env.PORT || 3000;
app.listen(port)
