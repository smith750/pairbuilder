'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../db');
const EventDao = require('../daos/event-dao');
const TeamDao = require('../daos/team-dao');
const ParticipantDao = require('../daos/participant-dao');

const eventDao = new EventDao(knex);
const teamDao = new TeamDao(knex);
const participantDao = new ParticipantDao(knex);

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index.html');
});

router.get('/teams', (req, res, next)=> {
    teamDao.lookupAllTeams()
        .then((teams) => res.send(teams));
});

router.get('/participants/team/:team_id', (req, res, next) => {
    const teamId = req.params.team_id;

    if (!teamId) {
        res.status(400).send("Team ID is required");
    } else {
        participantDao.lookupParticipantsByTeam(teamId)
            .then((participants) => {
                res.send(participants);
            });
    }
});

router.get('/participants/person_name', (req, res, next) => {
    const personName = req.query.name;

    if (!personName) {
        res.status(400).send("Person name is required");
    } else {
        participantDao.lookupParticipantByPersonName(personName)
            .then((particpants) => {
                res.send(particpants);
            });
    }
});

router.get('/participants', (req, res, next) => {
    participantDao.lookupParticipants()
        .then((participants) => {
            res.send(participants);
        });
});

router.put('/participants', (req, res) => {
    const teamId = req.body.team_id;
    const personName = req.body.name;

    let messages = [];
    if (!teamId) {
        messages.push('Please select a team.');
    }

    if (!personName) {
        messages.push('Please enter a name.');
    }

    if (messages.length > 0) {
        res.status(400).send(messages);
        return;
    }

    teamDao.lookupTeam(teamId)
        .then((team) => {
            if (!team) {
                res.status(400).send(['Team '+teamId+' could not be found']);
            } else {
                eventDao.lookupCurrentEvent()
                    .then((event) => {
                        participantDao.lookupExactParticipant(personName, teamId, event.id)
                            .then(() => {
                                participantDao.insertParticipant(personName, teamId, event.id)
                                    .then((id) => {
                                        res.send({'id': id});
                                    });
                                })
                            .catch(() => {
                                res.status(400).send(['Participant has already signed up for the current event.']);
                            });
                        });

            }
        });
});

router.get('/events/current', (req, res, next) => {
    eventDao.lookupCurrentEvent()
        .then((event) => {
            res.send(event);
        });
})


module.exports = router;
