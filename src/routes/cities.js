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
    if (!/application\/json/g.test(req.get('Content-Type'))) {
      res.status(400).json({ success: false, message: 'body must be application/json content type' });
      return;
    }
    citiesDb.insert(body)
      .then((id) => {
        res.redirect(`/api/v1/cities/${id}`);
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
  })
  .patch((req, res) => {
    const { body } = req;

    if (!/application\/json/g.test(req.get('Content-Type'))) {
      res.status(400).json({ success: false, message: 'body must be application/json content type' });
      return;
    }

    const city = Object.assign({}, body, { id: req.params.id });

    citiesDb.update(city)
      .then((numRows) => {
        if (numRows === 0) {
          res.status(400).json({ success: false, message: 'no records updated' });
          return;
        }
        res.redirect(`/api/v1/cities/${req.params.id}`);
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err.message });
      });
  })
  .delete((req, res) => {
    citiesDb.del(req.params.id)
      .then((id) => {
        if (id === 0) {
          res.status(404).json({ success: false, message: `could not find city with id ${req.params.id}` });
          return;
        }
        res.sendStatus(204);
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err.message });
      });
  });


module.exports = cities;
