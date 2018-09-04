const request = require('supertest');
const expect = require('expect');
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
      .then(done)
      .catch(done);
  });
  it('returns a 200 status', (done) => {
    response.expect(200, done);
  });
  it('returns a json content type', (done) => {
    response
      .expect('Content-Type', /json/, done);
  });
  it('without parameters returns first 10 cities', (done) => {
    response
      .expect(200)
      .then((res) => {
        const cities = res.body.map(el => ({ name: el.name, country: el.country }));
        expect(cities).toEqual(testData.slice(0, 10));
        done();
      })
      .catch(done);
  });
  afterEach((done) => {
    citiesDb.drop().finally(() => done());
  });
  after((done) => {
    server.close(done);
  });
});
