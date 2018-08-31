const cities = require('express').Router();
const citiesDb = require('../db/cities');

cities.route('/')
  .get((req, res) => {
    let limit;
    let offset;
    try {
      if (req.query.limit) {
        limit = Number.parseInt(req.query.limit, 10);
      }
      if (req.query.offset) {
        offset = Number.parseInt(req.query.offset, 10);
      }
    } catch (e) {
      // TODO send 400 with useful error message
      res.sendStatus(401);
    }
    citiesDb.list(limit, offset)
      .then((rows) => {
        res.json(rows);
      })
      .catch((err) => {
        res.status(500).json({ message: err.toString() });
      });
  });

module.exports = cities;
