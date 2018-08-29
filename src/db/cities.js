const knex = require('./index');

module.exports = {
  create: () => knex.schema.createTable('cities', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('country').notNullable();
    table.timestamps();
  }),
  drop: () => knex.schema.dropTableIfExists('cities'),
  insert: rows => knex.insert(rows).into('cities'),
  del: id => knex.del().from('cities').where('id', id),
  list: (limit, offset) => {
    const lim = limit || 10;
    const off = offset || 0;
    return knex
      .select('id', 'name', 'country', 'created_at', 'updated_at')
      .from('cities')
      .limit(lim)
      .offset(off);
  },
};
