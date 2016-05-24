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

    retrieveRawParticipants() {
        return this.eventDao.lookupCurrentEvent()
            .catch((error) => {
                console.log(error);
                return new Promise((resolve, reject) => reject(error));
            })
            .then((event) => {
                return this.knex.where({event_id: event.id}).select('name','team_id').from('participants')
                    .catch((error) => {
                        console.error(error);
                        new Promise((resolve, reject) => reject(error));
                    })
                    .then(rows => {
                        return new Promise((resolve, reject) => resolve(rows));
                    });
            });
    }

    pairParticipants(rand, previousRounds) {
        function equalsParticipant(tweedleDee, tweedleDum) {
            return tweedleDee.name === tweedleDum.name && tweedleDee.team_id === tweedleDum.team_id
        }

        function removePreviousRoundPartners(memberParticipant, remainingParticipants, previousRounds) {
            if (!previousRounds || previousRounds.length === 0) return remainingParticipants;
            // let's find the member's partners from previous rounds
            let previousPartners = [];
            for (let previousRound of previousRounds) {
                for (let partnering of previousRound) {
                    if (_.some(partnering, (participant) => equalsParticipant(participant, memberParticipant))) {
                        previousPartners = previousPartners.concat(partnering);
                    }
                }
            }
            let flattenedPartners = _.flattenDeep(previousPartners);
            return _.difference(remainingParticipants, flattenedPartners, equalsParticipant);
        }
        
        return this.retrieveRawParticipants()
            .catch((error) => {
                console.error(error);
                return new Promise((resolve, reject) => reject(error));
            })
            .then((participants) => {
                let remainingParticipants = participants.slice();
                let generatedPairs = [];
                const distinctTeamIds = _.uniq(_.map(participants, (participant) => participant.team_id));

                while (remainingParticipants.length > 3) {
                    let member1 = remainingParticipants[0];

                    // find all of the candidates they could pair with
                    let prospectivePartners = (distinctTeamIds.length === 1)
                        ? removePreviousRoundPartners(member1, remainingParticipants.slice(1), previousRounds)
                        : removePreviousRoundPartners(member1, _.filter(remainingParticipants.slice(1), (participant) => participant.team_id !== member1.team_id), previousRounds);

                    // randomly pick a partner
                    let partnerIndex = rand.integer(1, prospectivePartners.length-1);
                    let partner = prospectivePartners[partnerIndex];

                    // push onto array of pairs
                    generatedPairs.push([member1, partner]);
                    // remove them both from remaining participants
                    remainingParticipants = _.filter(remainingParticipants.slice(1), (participant) => !equalsParticipant(participant, partner));
                };
                generatedPairs.push(remainingParticipants);
                return new Promise((resolve, reject) => resolve(generatedPairs));
            });
    }
}

module.exports = ParticipantDao;