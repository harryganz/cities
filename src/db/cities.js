const knex = require('./index');

const cities = {
  create: () => knex.schema.createTable('cities', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('country').notNullable();
  }),
  drop: () => knex.schema.dropTableIfExists('cities'),
  insert: (data) => {
    if (typeof data !== 'object') {
      throw new Error('inserted data must be object or array');
    }
    return knex.insert(data).into('cities');
  },
  del: id => knex.del().from('cities').where('id', id),
  list: (limit, offset) => {
    const lim = (limit && limit > 0) ? limit : 10;
    const off = (offset && offset > 0) ? offset : 0;
    return knex
      .select()
      .from('cities')
      .limit(lim)
      .offset(off);
  },
  get: id => knex
    .first()
    .from('cities')
    .where('id', id),
  update: city => knex
    .from('cities')
    .where('id', city.id)
    .update({
      name: city.name,
      country: city.country,
    }),
};

module.exports = cities;
