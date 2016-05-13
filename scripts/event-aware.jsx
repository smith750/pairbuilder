import React from 'react';
import axios from 'axios';

const server = 'http://localhost:3000';

class EventAwareComponent extends React.Component {
    constructor() {
        super();
        this.state = {currentEvent: {}};
    }

    componentWillMount() {
        axios.get(server+'/events/current')
            .then((response) => {
                const newState = {currentEvent: response.data};
                this.setState(newState);
            })
            .catch((response) => {
                console.error("Could not access resource, "+response);
            })
    }
}

module.exports = {EventAwareComponent: EventAwareComponent};