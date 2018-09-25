const app = require('./src/app');
const citiesDb = require('./src/db/cities');
const mockCities = require('./src/fixtures/cities');

const port = process.env.PORT || 3000;
citiesDb.create()
  .then(() => citiesDb.insert(mockCities(100)))
  .then(() => {
    app.listen(port);
  });

function cleanUp() {
  console.log('cleaning up');
  citiesDb.drop().then(() => {
    process.exit();
  });
}

process.on('SIGINT', cleanUp);
process.on('SIGHUP', cleanUp);
