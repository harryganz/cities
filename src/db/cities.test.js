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

describe('cities.insert function', () => {
  beforeEach((done) => {
    cities.create()
      .then(() => done());
  });
  it('adds passed in array of data to cities database', (done) => {
    const testData = [
      { name: 'test 1', country: 'test 1' },
      { name: 'test 2', country: 'test 2' },
    ];

    cities.insert(testData)
      .then(() => knex.select('name', 'country').from('cities'))
      .then(rows => expect(rows).toEqual(testData))
      .then(() => done());
  });
  afterEach((done) => {
    cities.drop()
      .then(() => done());
  });
});
