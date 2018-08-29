const request = require('supertest');
const app = require('./app');

describe('GET /healthcheck', () => {
  let server;
  let response;
  const port = 3001;
  before((done) => {
    server = app.listen(port, () => done());
  });
  beforeEach(() => {
    response = request(`http://localhost:${port}`)
      .get('/healthcheck');
  });
  it('returns a 200 status', (done) => {
    response.expect(200, done);
  });
  it('returns a body containing \'server is up\'', (done) => {
    response.expect(200, /server is up/i, done);
  });
  after((done) => {
    server.close(() => done());
  });
});
