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
    res.render('index', { title: 'Express' });
});

router.get('/teams', (req, res, next)=> {
    teamDao.lookupAllTeams()
        .then((teams) => res.send(teams));
});

router.get('/participants', (req, res, next) => {
    const teamId = req.params.team_id;
    const personName = req.params.name;

    if (personName) {
        participantDao.lookupParticipantByPersonName(personName)
            .then((particpants) => {
                res.send(particpants);  
            });
    } else if (teamId) {
        participantDao.lookupParticipantsByTeam(teamId)
            .then((participants) => {
                res.send(participants);
            });
    } else {
        participantDao.lookupParticipants()
            .then((participants) => {
                res.send(participants);
            });
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

    teamDao.lookupTeam(teamId)
        .then((team) => {
            console.log("did the team lookup");
            if (!team) {
                res.status(400).send('team_id '+teamId+' could not be found');
            } else {
                eventDao.lookupCurrentEvent()
                    .then((event) => {
                        console.log("did the event lookup");
                        participantDao.lookupExactParticipant(personName, teamId, event.id)
                            .then(() => {
                                participantDao.insertParticipant(personName, teamId, event.id)
                                    .then((id) => {
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
