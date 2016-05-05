'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../db');
const _ = require('lodash');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/teams', (req, res, next)=> {
  knex.select('id','name').from('teams')
      .then(rows => {
          const teams = _.map(rows, (row) => {
              return { 'id': row['id'], 'name': row['name'] }
          });
          res.send(teams);
      });
});

module.exports = router;
