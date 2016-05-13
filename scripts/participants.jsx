import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {EventAwareComponent} from './event-aware.jsx';
import {mainStyle, tableCellStyle, headerStyle} from './styles.jsx';

const server = 'http://localhost:3000';

class ParticipantsTitle extends EventAwareComponent {
    render() {
        if (this.state.currentEvent) {
            return (
                <h3 style={headerStyle}>Participants for {this.state.currentEvent.name}</h3>
            );
        } else {
            return <div></div>;
        }
    }
}

class ParticipantsTable extends React.Component {
    constructor() {
        super();
        this.state = {participants: []};
    }

    componentWillMount() {
        axios.get('/participants')
            .then((response) => {
                this.setState({participants: response.data});
            })
            .catch((error) => {
                console.error('Could not load participants '+error);
            });
    }

    render() {
        if (this.state.participants.length > 0) {
            const participantRows = this.state.participants.map((participant, index) => {
                const key = 'person'+index;
                return <tr key={key}><td style={tableCellStyle}>{participant.name}</td><td style={tableCellStyle}>{participant.team}</td></tr>;
            });
            return (
                <table>
                    <tbody>
                        <tr>
                            <th style={tableCellStyle}>Name</th>
                            <th style={tableCellStyle}>Team</th>
                        </tr>
                        {participantRows}
                    </tbody>
                </table>
            );
        } else {
            return (
                <div>There are currently no participants.</div>
            );
        }
    }
}

const ParticipantListMain = () => (<div style={mainStyle}><ParticipantsTitle/><ParticipantsTable/></div>);

ReactDOM.render(<ParticipantListMain/>, document.getElementById('main'));