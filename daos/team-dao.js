'use strict';

const Promise = require('bluebird');

class TeamDao {
    constructor(knex) {
        this.knex = knex;
    }

    lookupTeam(teamId) {
        return this.knex.where({id: teamId}).select('id','name').from('teams')
            .catch((error) => new Promise((resolve, reject) => reject(error)))
            .then((rows) => {
                if (rows && rows.length > 0) {
                    return new Promise((resolve, reject) => resolve(rows[0]));
                } else {
                    return new Promise((resolve, reject) => reject("no team found"));
                }
            });
    }
    
    lookupAllTeams() {
        return this.knex.select('id','name').from('teams')
            .catch((error) => new Promise((resolve, reject) => reject(error)))
            .then(rows => {
                return new Promise((resolve,reject) => resolve(rows));
            });
    }
}

module.exports = TeamDao;