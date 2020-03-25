const express = require('express');
const app = express();

// GET
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

const port = process.env.PORT || 3000;
app.listen(port)
