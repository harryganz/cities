const knex = require('./index');

module.exports = {
  create: () => knex.schema.createTable('cities', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('country').notNullable();
    table.timestamps();
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
      .select('id', 'name', 'country', 'created_at', 'updated_at')
      .from('cities')
      .limit(lim)
      .offset(off);
  },
};
