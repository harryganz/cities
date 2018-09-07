const expect = require('expect');
const cities = require('./cities');
const knex = require('./index');
const fakeCities = require('../fixtures/cities');

describe('cities.create function', () => {
  before((done) => {
    knex.schema.dropTableIfExists('cities')
      .finally(() => done());
  });
  it('creates the \'cities\' table', (done) => {
    cities.create()
      .then(() => knex.schema.hasTable('cities'))
      .then(exists => expect(exists).toBe(true))
      .then(done)
      .catch(done);
  });
  after((done) => {
    knex.schema.dropTableIfExists('cities')
      .then(() => done())
      .catch(done);
  });
});

describe('cities.drop function', () => {
  before((done) => {
    knex.schema.createTable('cities', (table) => {
      table.increments('id').primary();
      table.string('name');
    })
      .then(() => done())
      .catch(done);
  });
  it('drops the \'cities\' table', (done) => {
    cities.drop()
      .then(() => knex.schema.hasTable('cities'))
      .then(exists => expect(exists).toBe(false))
      .then(() => done())
      .catch(done);
  });
});

describe('cities.insert function', () => {
  beforeEach((done) => {
    cities.create()
      .then(() => done())
      .catch(done);
  });
  it('adds passed in single object to cities database', (done) => {
    const testData = fakeCities()[0];
    cities.insert(testData)
      .then(() => knex.select('name', 'country').from('cities'))
      .then(rows => expect(rows[0]).toEqual(testData))
      .then(() => done())
      .catch(done);
  });
  it('adds passed in array of data to cities database', (done) => {
    const testData = fakeCities(5);

    cities.insert(testData)
      .then(() => knex.select('name', 'country').from('cities'))
      .then(rows => expect(rows).toEqual(testData))
      .then(() => done())
      .catch(done);
  });
  it('throws an error if passed a non-object type', () => {
    expect(() => cities.insert()).toThrow();
  });
  afterEach((done) => {
    cities.drop()
      .then(() => done())
      .catch(done);
  });
});
describe('cities.del', () => {
  beforeEach((done) => {
    cities.create()
      .then(() => done())
      .catch(done);
  });
  it('deletes row with passed in id', (done) => {
    let id;
    cities.insert({ name: 'test 1', country: 'test 1' })
      .then((ids) => {
        [id] = ids;
        return cities.del(id);
      })
      .then(() => knex
        .select('id')
        .from('cities')
        .where({ id }))
      .then(rows => expect(rows).toEqual([]))
      .then(() => done())
      .catch(done);
  });
  it('does nothing if invalid id passed in', (done) => {
    cities.insert({ name: 'test 1', country: 'test 1' })
      .then(() => cities.del(-1))
      .then(() => knex.count('id as num').from('cities'))
      .then((rows) => {
        const [count] = rows;
        expect(count.num).toBe(1);
      })
      .then(() => done())
      .catch(done);
  });
  afterEach((done) => {
    cities.drop()
      .then(() => done())
      .catch(done);
  });
});

describe('cities.list function', () => {
  const testData = fakeCities(100);
  beforeEach((done) => {
    cities.create()
      .then(() => cities.insert(testData))
      .then(() => done())
      .catch(done);
  });
  it('returns the first 10 items with no arguments passed', (done) => {
    cities.list()
      .then((rows) => {
        expect(rows.map(el => ({ name: el.name, country: el.country })))
          .toEqual(testData.slice(0, 10));
      })
      .then(() => done())
      .catch(done);
  });
  it('returns the first 5 items if limit of 5 is passed', (done) => {
    cities.list(5)
      .then((rows) => {
        expect(rows.map(el => ({ name: el.name, country: el.country })))
          .toEqual(testData.slice(0, 5));
      })
      .then(() => done())
      .catch(done);
  });
  it('returns items offset by offset parameter', (done) => {
    cities.list(1, 5)
      .then((rows) => {
        expect(rows.map(el => ({ name: el.name, country: el.country })))
          .toEqual(testData.slice(5, 6));
      })
      .then(() => done())
      .catch(done);
  });
  it('treats offset lower than zero as zero', (done) => {
    cities.list(1, -1)
      .then((rows) => {
        expect(rows.map(el => ({ name: el.name, country: el.country })))
          .toEqual(testData.slice(0, 1));
      })
      .then(() => done())
      .catch(done);
  });
  it('treats limits lower than zero as 10', (done) => {
    cities.list(-1)
      .then((rows) => {
        expect(rows.map(el => ({ name: el.name, country: el.country })))
          .toEqual(testData.slice(0, 10));
      })
      .then(() => done())
      .catch(done);
  });
  afterEach((done) => {
    cities.drop()
      .then(() => done())
      .catch(done);
  });
});
describe('cities.get function', () => {
  const testCity = { name: 'test 1', country: 'test ' };
  beforeEach((done) => {
    cities.create()
      .then(() => cities.insert(testCity))
      .then(() => done())
      .catch(done);
  });
  it('returns the item with the passed in id', (done) => {
    cities.get(1)
      .then((row) => {
        const { name, country } = row;
        expect({ name, country }).toEqual(testCity);
      })
      .then(() => done())
      .catch(done);
  });
  it('returns undefined if item with id cannot be found', (done) => {
    cities.get(-1)
      .then(row => expect(row).toBe(undefined))
      .then(() => done())
      .catch(done);
  });
  afterEach((done) => {
    cities.drop()
      .then(() => done())
      .catch(done);
  });
});
describe('cities.update method', () => {
  const testData = { name: 'change this', country: 'change this too' };
  beforeEach((done) => {
    cities.create()
      .then(() => cities.insert(testData))
      .then(() => done())
      .catch(done);
  });
  it('changes the entry with the passed in object', (done) => {
    const newCity = { id: 1, name: 'city is changed', country: 'country is changed too' };
    cities.update(newCity)
      .then(() => cities.get(newCity.id))
      .then((row) => {
        expect(row).toEqual(newCity);
      })
      .then(() => done())
      .catch(done);
  });
  it('returns 0 if object with corresponding id is not found', (done) => {
    const newCity = { id: 5, name: 'test1', country: 'test2' };
    cities.update(newCity)
      .then(numRows => expect(numRows).toBe(0))
      .then(() => done())
      .catch(done);
  });
  it('keeps country field the same if only name is updated', (done) => {
    const newCity = { id: 1, name: 'new name' };
    const expected = Object.assign({}, testData, newCity);
    cities.update(newCity)
      .then(() => cities.get(newCity.id))
      .then((row) => {
        expect(row).toEqual(expected);
      })
      .then(() => done())
      .catch(done);
  });
  it('keeps name field the same if only country is updated', (done) => {
    const newCity = { id: 1, country: 'new country' };
    const expected = Object.assign({}, testData, newCity);
    cities.update(newCity)
      .then(() => cities.get(newCity.id))
      .then((row) => {
        expect(row).toEqual(expected);
      })
      .then(() => done())
      .catch(done);
  });
  afterEach((done) => {
    cities.drop()
      .then(() => done())
      .catch(done);
  });
});
