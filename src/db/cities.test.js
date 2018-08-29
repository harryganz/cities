const expect = require('expect');
const cities = require('./cities');
const knex = require('./index');

describe('cities.create function', () => {
  before((done) => {
    knex.schema.dropTableIfExists('cities')
      .then(() => done());
  });
  it('creates the \'cities\' table', (done) => {
    cities.create()
      .then(() => knex.schema.hasTable('cities'))
      .then(exists => expect(exists).toBe(true))
      .then(() => done());
  });
  after(() => {
    knex.destroy();
  });
});
