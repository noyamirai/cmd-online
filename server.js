/* eslint-disable no-undef */
const express = require(`express`);
const app = express();
const port = process.env.PORT || 3000;

app.get(`/`, (req, res) => {
    res.send("Hello world!");
});

app.get(`*`, (req, res) => {
    res.status(404).send(`Page not found!`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});