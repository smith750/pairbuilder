'use strict';

const Promise = require('bluebird');

class EventDao {
    constructor(knex) {
        this.knex = knex;
    }

    lookupCurrentEvent() {
        return this.knex.where({ 'current': true }).select('id','name', 'occurring_on','round_count').from('events')
            .catch((error) => new Promise((resolve, reject) => reject(error)))
            .then(rows => {
                const event_row = rows[0]
                const event = {
                    id: event_row['id'],
                    name: event_row['name'],
                    occurring_on: event_row['occurring_on'],
                    round_count: event_row['round_count']
                };
                return new Promise((resolve, reject) => resolve(event_row));
            });
    }
}

module.exports = EventDao;