const express = require('express');
const bodyParser = require('body-parser');

const citiesRouter = require('./routes/cities');

const app = express();
// App wide middlewares
app.use(bodyParser.json());

// Routes
app.get('/healthcheck', (req, res) => {
  res.send('server is up');
});
app.use('/api/v1/cities', citiesRouter);

module.exports = app;
