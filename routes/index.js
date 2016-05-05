'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../db');
const _ = require('lodash');
const Promise = require('bluebird');



function buildTeamRow(row) {
    return { 'id': row['id'], 'name': row['name'] };
}

function lookupCurrentEvent(callback) {
    knex.where({ 'current': true }).select('id','name', 'occurring_on','round_count').from('events')
        .then(rows => {
            const event_row = rows[0]
            const event = {
                id: event_row['id'],
                name: event_row['name'],
                occurring_on: event_row['occurring_on'],
                round_count: event_row['round_count']
            };
            callback(event_row)
        });
}

function buildParticipantTeamRow(row) {
    return {
        person: row['person_name'],
        team: row['team_name']
    };
}

function lookupParticipantByPersonName(personName, res) {
    lookupCurrentEvent((event) => {
       knex.where({ name: personName, event_id: event.id }).select('participants.name as person_name', 'teams.name as team_name').from('participants').innerJoin('teams', 'participants.team_id', 'id')
           .then(rows => {
              if (rows && rows.length > 0) {
                  const person = rows[0];
                  res.send(buildParticipantTeamRow(person));
              } else {
                  res.send({});
              }
           });
    });
}

function lookupParticipantsByTeam(teamId, res) {
    lookupCurrentEvent((event) => {
        knex.where({ team_id: teamId, event_id: event.id }).select('name').from('participants')
            .then(rows => {
                const participantNames = _.map(rows, (val) => val.name);
                res.send(participantNames);
            });
    })
}

function lookupParticipants(res) {
    lookupCurrentEvent((event) => {
        knex.where({event_id: event.id}).select('participants.name as person_name', 'teams.name as team_name').from('participants').innerJoin('teams', 'participants.team_id', 'teams.id')
            .then(rows => {
                const participants = _.map(rows, (row) => buildParticipantTeamRow(row));
                res.send(participants);
            });
    });
}

function lookupTeam(teamId, callback) {
    knex.where({id: teamId}).select('id','name').from('teams')
        .then((rows) => {
            if (rows && rows.length > 0) {
                callback(buildTeamRow(rows[0]));
            } else {
                callback(undefined);
            }
        });
}

function lookupExactParticipant(name, teamId, eventId) {
    const promise = knex.where({team_id: teamId, name: name.toLowerCase(), event_id: eventId}).select('id').from('participants')
        .then((rows) => {
            if (rows && rows.length > 0) {
                return new Promise((resolve, reject) => { reject(); });
            } else {
                return new Promise((resolve, reject) => { resolve(); });
            }
        });
    return promise;
}

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', { title: 'Express' });
});

router.get('/teams', (req, res, next)=> {
    knex.select('id','name').from('teams')
        .then(rows => {
            const teams = _.map(rows, (row) => buildTeamRow(row));
            res.send(teams);
        });
});

router.get('/participants', (req, res, next) => {
    const teamId = req.params.team_id;
    const personName = req.params.name;

    if (personName) {
        lookupParticipantByPersonName(personName, res);
    } else if (teamId) {
        lookupParticipantsByTeam(teamId, res);
    } else {
        lookupParticipants(res);
    }
});

router.put('/participants', (req, res) => {
    const teamId = req.body.team_id;
    const personName = req.body.name;

    if (!teamId) {
        res.status(400).send('team_id must not be null');
    }

    if (!personName) {
        res.status(400).send('person_name must not be null');
    }

    lookupTeam(teamId, (team) => {
        console.log("did the team lookup");
        if (!team) {
            res.status(400).send('team_id '+teamId+' could not be found');
        } else {
            lookupCurrentEvent((event) => {
                console.log("did the event lookup");
                lookupExactParticipant(personName, teamId, event.id)
                    .then(() => {
                            knex('participants').returning('id').insert({
                                    name: personName,
                                    team_id: teamId,
                                    event_id: event.id
                                })
                                .then(id => {
                                    res.send({'id': id});
                                });
                        }, () => {
                            res.status(400).send("Participant has already signed up for the current event");
                        }
                    );
            });
        }
    });
});


module.exports = router;
