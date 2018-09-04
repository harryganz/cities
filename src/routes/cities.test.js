const request = require('supertest');
const expect = require('expect');
const app = require('../app');
const citiesDb = require('../db/cities');
const mockCities = require('../fixtures/cities');

function pluck(obj, keys) {
  const result = {};
  Object.keys(obj).forEach((key) => {
    if (keys.includes(key)) {
      result[key] = obj[key];
    }
  });
  return result;
}

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
        const cities = res.body.map(el => pluck(el, ['name', 'country']));
        expect(cities).toEqual(testData.slice(0, 10));
        done();
      })
      .catch(done);
  });
  it('with limit query param set to 1 returns the first city', (done) => {
    response
      .query({ limit: 1 })
      .expect(200)
      .then((res) => {
        const cities = res.body.map(el => pluck(el, ['name', 'country']));
        expect(cities).toEqual(testData.slice(0, 1));
        done();
      })
      .catch(done);
  });
  it('with offset param set to 1 returns 10 results offset by 1', (done) => {
    response
      .query({ offset: 1 })
      .expect(200)
      .then((res) => {
        const cities = res.body.map(el => pluck(el, ['name', 'country']));
        expect(cities).toEqual(testData.slice(1, 11));
        done();
      })
      .catch(done);
  });
  it('throws a 400 error if limit is negative number', (done) => {
    response
      .query({ limit: -1 })
      .expect(400, /must be a positive/, done);
  });
  it('throws a 400 error if limit is not a number', (done) => {
    response
      .query({ limit: '12lls' })
      .expect(400, /must be a number/, done);
  });
  it('throws a 400 error if offset is not a number', (done) => {
    response
      .query({ offset: '1243k' })
      .expect(400, /must be a number/, done);
  });
  it('throws a 400 error if offset is a negative number', (done) => {
    response
      .query({ offset: -1 })
      .expect(400, /must be a positive/, done);
  });
  afterEach((done) => {
    citiesDb.drop().finally(() => done());
  });
  after((done) => {
    server.close(done);
  });
});
