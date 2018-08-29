const express = require('express');
const bodyParser = require('body-parser');

const app = express();
// App wide middlewares
app.use(bodyParser.json());

// Routes
app.get('/healthcheck', (req, res) => {
  res.send('server is up');
});

module.exports = app;
