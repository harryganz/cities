const app = require('./src/app');
const citiesDb = require('./src/db/cities');
const mockCities = require('./src/fixtures/cities');

const port = process.env.PORT || 3000;
app.listen(port);
