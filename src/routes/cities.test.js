const request = require('supertest');
const app = require('../app');
const citiesDb = require('../db/cities');
const mockCities = require('../fixtures/cities');

describe('GET /api/v1/cities', () => {
  let server;
  let response;
  const port = 3001;
  const testData = mockCities(100);
  before((done) => {
    server = app.listen(port, done);
  });
  beforeEach((done) => {
    citiesDb.create()
      .then(() => citiesDb.insert(testData))
      .then(() => {
        response = request(`http://localhost:${port}`)
          .get('/api/v1/cities');
      })
      .finally(() => done());
  });
  it('returns a 200 status', (done) => {
    response.expect(200, done);
  });
  afterEach((done) => {
    citiesDb.drop().finally(() => done());
  });
  after((done) => {
    server.close(done);
  });
});
