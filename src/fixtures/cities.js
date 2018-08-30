const faker = require('faker'); //eslint-disable-line

faker.seed(1);

module.exports = (n) => {
  const count = (n > 0) ? n : 1;
  const result = [];
  for (let i = 0; i < count; i += 1) {
    result.push({ name: faker.address.city(), country: faker.address.country() });
  }

  return result;
};
