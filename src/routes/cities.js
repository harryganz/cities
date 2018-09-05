const cities = require('express').Router();
const citiesDb = require('../db/cities');

cities.route('/')
  .get((req, res) => {
    let limit;
    let offset;
    try {
      if (req.query.limit) {
        limit = Number(req.query.limit, 10);
        if (Number.isNaN(limit)) {
          throw new Error('Limit must be a number');
        }
        if (limit < 0) {
          throw new Error('Limit must be a positive number');
        }
      }
      if (req.query.offset) {
        offset = Number(req.query.offset, 10);
        if (Number.isNaN(offset)) {
          throw new Error('Offset must be a number');
        }
        if (offset < 0) {
          throw new Error('Offset must be a positive number');
        }
      }
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
      return;
    }
    citiesDb.list(limit, offset)
      .then((rows) => {
        res.json(rows);
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err.message });
      });
  })
  .post((req, res) => {
    const { body } = req;

    citiesDb.insert(body)
      .then((id) => {
        res.redirect(`cities/${id}`);
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err.message });
      });
  });

cities.route('/:id')
  .get((req, res) => {
    citiesDb.get(req.params.id)
      .then((row) => {
        if (typeof row === 'undefined') {
          res.status(404).json({ success: false, message: `could not find city with id ${req.params.id}` });
          return;
        }
        res.json(row);
      })
      .catch(err => res.status(500).json({ success: false, message: err.message }));
  });


module.exports = cities;
