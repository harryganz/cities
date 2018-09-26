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
    citiesDb.drop()
      .then(() => done())
      .catch(done);
  });
  after((done) => {
    server.close(done);
  });
});

describe('POST /api/v1/cities', () => {
  let server;
  let response;
  const port = 3001;
  before((done) => {
    server = app.listen(port, done);
  });
  beforeEach((done) => {
    citiesDb.create()
      .then(() => {
        response = request(`http://localhost:${port}`)
          .post('/api/v1/cities');
      })
      .then(() => done())
      .catch(done);
  });
  afterEach((done) => {
    citiesDb.drop()
      .then(() => done())
      .catch(done);
  });
  it('returns a 200 status', (done) => {
    response
      .set('Content-Type', 'application/json')
      .send({ name: 'test 1', country: 'test 1' })
      .expect(302, done);
  });
  it('adds valid city to database', (done) => {
    const testData = { name: 'Test 1', country: 'Test 2' };
    response
      .set('Content-Type', 'application/json')
      .send(testData)
      .expect(302)
      .then(() => citiesDb.list())
      .then((rows) => {
        expect(pluck(rows[0], ['name', 'country'])).toEqual(testData);
      })
      .then(() => done())
      .catch(done);
  });
  it('returns a 400 status if the content type is not json', (done) => {
    response
      .send('gibberish')
      .expect(400, done);
  });
  it('redirects to the newly added item\'s show page', (done) => {
    const testData = { name: 'test 1', country: 'test 2' };
    response
      .set('Content-Type', 'application/json')
      .send(testData)
      .expect(302)
      .then((res) => {
        expect(res.header.location).toMatch(/\/api\/v1\/cities\/1$/);
        done();
      })
      .catch(done);
  });
  after((done) => {
    server.close(done);
  });
});
describe('GET /api/v1/cities/:id', () => {
  let server;
  const testCities = mockCities(100);
  let response;
  const port = 3001;
  before((done) => {
    server = app.listen(port, done);
  });
  beforeEach((done) => {
    citiesDb.create()
      .then(() => citiesDb.insert(testCities))
      .then(() => {
        response = request(`http://localhost:${port}`);
      })
      .then(() => done())
      .catch(done);
  });
  it('returns a 200 status', (done) => {
    response.get('/api/v1/cities/1')
      .expect(200, done);
  });
  it('returns the city with the provided id', (done) => {
    response.get('/api/v1/cities/1')
      .expect(200)
      .then((res) => {
        const { name, country } = res.body;
        expect({ name, country }).toEqual(testCities[0]);
        done();
      })
      .catch(done);
  });
  it('returns a 404 if city not found', (done) => {
    response.get('/api/v1/cities/9999999')
      .expect(404, /could not find city/i, done);
  });
  it('returns a 400 is non-numeric passed in', (done) => {
    response.get('/api/v1/cities/foo')
      .expect(400, done);
  });
  afterEach((done) => {
    citiesDb.drop()
      .then(() => done())
      .catch(done);
  });
  after((done) => {
    server.close(done);
  });
});
describe('DELETE /api/v1/cities/:id', () => {
  let server;
  let response;
  const port = 3001;
  const testData = { name: 'test 1', country: 'test 2' };
  before((done) => {
    server = app.listen(port, done);
  });
  beforeEach((done) => {
    citiesDb.create()
      .then(() => citiesDb.insert(testData))
      .then(() => {
        response = request(`http://localhost:${port}`);
      })
      .then(() => done())
      .catch(done);
  });
  it('returns a 204 status if valid id passed in', (done) => {
    response
      .delete('/api/v1/cities/1')
      .expect(204, done);
  });
  it('returns a 404 status if invalid id passed in', (done) => {
    response
      .delete('/api/v1/cities/2')
      .expect(404, done);
  });
  it('returns a 400 if non-numeric id passed in', (done) => {
    response
      .delete('/api/v1/cities/foo')
      .expect(400, done);
  });
  it('delete the record with the corresponding id if valid id passed in', (done) => {
    response
      .delete('/api/v1/cities/1')
      .expect(204)
      .then(() => citiesDb.get(1))
      .then((row) => {
        expect(row).toBe(undefined);
      })
      .then(() => done())
      .catch(done);
  });
  afterEach((done) => {
    citiesDb.drop()
      .then(() => done())
      .catch(done);
  });
  after((done) => {
    server.close(done);
  });
});
describe('PATCH /api/v1/cities/:id', () => {
  let server;
  let response;
  const port = 3001;
  const testCity = { name: 'test1', country: 'test2' };
  before((done) => {
    server = app.listen(port, done);
  });
  beforeEach((done) => {
    citiesDb.create()
      .then(() => citiesDb.insert(testCity))
      .then(() => {
        response = request(`http://localhost:${port}`);
      })
      .then(() => done())
      .catch(done);
  });
  it('redirects to show page for updated city', (done) => {
    const newCity = { name: 'test3', country: 'test4' };
    response
      .patch('/api/v1/cities/1')
      .set('Content-Type', 'application/json')
      .send(newCity)
      .expect(302)
      .then((res) => {
        expect(res.headers.location).toMatch(/api\/v1\/cities\/1$/);
      })
      .then(() => done())
      .catch(done);
  });
  it('updates database entry with passed in data', (done) => {
    const newCity = { name: 'updated name', country: 'updated country' };

    response
      .patch('/api/v1/cities/1')
      .set('Content-Type', 'application/json')
      .send(newCity)
      .expect(302)
      .then(() => citiesDb.get(1))
      .then((row) => {
        expect(row).toEqual(Object.assign({}, { id: 1 }, newCity));
      })
      .then(() => done())
      .catch(done);
  });
  it('returns a 400 status if content type is not json', (done) => {
    response
      .patch('/api/v1/cities/1')
      .send('gibberish')
      .expect(400, done);
  });
  afterEach((done) => {
    citiesDb.drop()
      .then(() => done())
      .catch(done);
  });
  after((done) => {
    server.close(done);
  });
});
