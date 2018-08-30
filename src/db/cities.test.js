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
  after((done) => {
    knex.schema.dropTableIfExists('cities')
      .then(() => done());
  });
});

describe('cities.drop function', () => {
  before((done) => {
    knex.schema.createTable('cities', (table) => {
      table.increments('id').primary();
      table.string('name');
    })
      .then(() => done());
  });
  it('drops the \'cities\' table', (done) => {
    cities.drop()
      .then(() => knex.schema.hasTable('cities'))
      .then(exists => expect(exists).toBe(false))
      .then(() => done());
  });
});
