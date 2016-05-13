'use strict';

const Promise = require('bluebird');
const EventDao = require('../daos/event-dao.js');
const _ = require('lodash');

class ParticipantDao {
    constructor(knex) {
        this.knex = knex;
        this.eventDao = new EventDao(knex);
    }

    buildParticipantTeamRow(row) {
        return {
            name: row['person_name'],
            team: row['team_name']
        };
    }

    lookupParticipantByPersonName(personName) {
        return this.eventDao.lookupCurrentEvent()
            .catch((error) => new Promise((resolve, reject) => reject(error)))
            .then((event) => {
                return this.knex.whereRaw('participants.name = ? and event_id = ?', [personName, event.id]).select('participants.name as person_name', 'teams.name as team_name').from('participants').innerJoin('teams', 'participants.team_id', 'teams.id')
                    .catch((error) => new Promise((resolve, reject) => reject(error)))
                    .then(rows => {
                        console.log(_.join(rows, ","));
                        if (rows && rows.length > 0) {
                            const person = rows[0];
                            return new Promise((resolve, reject) => resolve(this.buildParticipantTeamRow(person)));
                        } else {
                            return new Promise((resolve, reject) => resolve({}));
                        }
                    });
            });
    }

    lookupParticipantsByTeam(teamId, res) {
        return this.eventDao.lookupCurrentEvent()
            .catch((error) => new Promise((resolve, reject) => reject(error)))
            .then((event) => {
                return this.knex.where({ team_id: teamId, event_id: event.id }).select('name').from('participants')
                    .catch((error) => new Promise((resolve, reject) => reject(error)))
                    .then(rows => {
                        const participantNames = _.map(rows, (val) => val.name);
                        return new Promise((resolve, reject) => resolve(participantNames));
                    });
            });
    }

    lookupParticipants() {
        return this.eventDao.lookupCurrentEvent()
            .catch((error) => new Promise((resolve, reject) => reject(error)))
            .then((event) => {
                return this.knex.where({event_id: event.id}).select('participants.name as person_name', 'teams.name as team_name').from('participants').innerJoin('teams', 'participants.team_id', 'teams.id')
                    .catch((error) => new Promise((resolve, reject) => reject(error)))
                    .then(rows => {
                        const participants = _.map(rows, (row) => this.buildParticipantTeamRow(row));
                        return new Promise((resolve, reject) => resolve(participants));
                    });
            });
    }

    lookupExactParticipant(name, teamId, eventId) {
        return this.knex.whereRaw('team_id = ? and lcase(name) = ? and event_id = ?', [teamId, name.toLowerCase(), eventId]).select('id').from('participants')
            .catch((error) => {
                return new Promise((resolve, reject) => reject(error))
            })
            .then((rows) => {
                if (rows && rows.length > 0) {
                    return new Promise((resolve, reject) => { reject(); });
                } else {
                    return new Promise((resolve, reject) => { resolve(); });
                }
            });
    }

    insertParticipant(personName, teamId, eventId) {
        return this.knex('participants').returning('id').insert({
                name: personName,
                team_id: teamId,
                event_id: eventId
            })
            .catch((error) => new Promise((resolve, reject) => reject(error)))
            .then(id => {
                return new Promise((resolve, reject) => resolve(id));
            });
    }
}

module.exports = ParticipantDao;