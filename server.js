const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();
const port = 3001;


app.get('/', (req, res) => {
    res.send('Lead Scoring API is running!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});