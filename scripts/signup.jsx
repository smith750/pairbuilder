import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {EventAwareComponent} from './event-aware.jsx';
import {mainStyle, headerStyle, successStyle, errorStyle} from './styles.jsx';

const server = location.protocol+'//'+location.host;

class SignupTitle extends EventAwareComponent {
    render() {
        if (Object.keys(this.state.currentEvent).length > 0) {
            return (<h3 style={headerStyle}>Sign Up for {this.state.currentEvent.name}</h3>)
        } else {
            return (<span></span>);
        }
    }
}

class SignupForm extends React.Component {
    constructor() {
        super();
        this.state = {name: "", team_id: "", error_messages: [], message: ""};
        this.updateName = this.updateName.bind(this);
        this.updateTeamId = this.updateTeamId.bind(this);
        this.addParticipant = this.addParticipant.bind(this);
    }

    updateName(event) {
        this.setState({name: event.target.value});
    }

    updateTeamId(teamId) {
        this.setState({team_id: teamId});
    }
    
    addParticipant() {
        const requestBody = {name: this.state.name, team_id: this.state.team_id};
        axios.put(server+'/participants',requestBody)
            .then(() => {
                this.setState({message: "You have been registered!  See you there!"});
            })
            .catch((errors) => {
                this.setState({error_messages: errors.data});
            });
    }
    
    render() {
        if (this.state.message.length > 0) {
            return (
                <div id="success" style={successStyle}>
                    {this.state.message}
                </div>
            );
        } else {
            return (
                <div id="signup-form" className="pure-form pure-form-aligned">
                    <ErrorMessages messages={this.state.error_messages}/>
                    <div className="pure-control-group"><label htmlFor="name">Name:</label><input type="text" id="name" size="40" onChange={this.updateName}/></div>
                    <div className="pure-control-group"><label htmlFor="team_id">Team:</label><TeamDropDown onUpdate={this.updateTeamId}/></div>
                    <div className="pure-controls"><button className="pure-button pure-button-primary" onClick={this.addParticipant}>Register!</button></div>
                </div>
            );
        }
    }
}

class TeamDropDown extends React.Component {
    constructor() {
        super();
        this.state = {teams:[]};
        this.updateTeamId = this.updateTeamId.bind(this);
    }

    componentWillMount() {
        axios.get(server+"/teams")
            .then((response) => {
                this.setState({teams: response.data});
                this.props.onUpdate(response.data[0].id);
            })
            .catch((error) => {
                console.error("You likely already realized this, but we cannot access teams", error);
            });
    }

    updateTeamId(event) {
        this.props.onUpdate(this.state.teams[event.target.selectedIndex].id);
    }

    render() {
        const teamOptions = this.state.teams.map((team) => {
            const key = "team"+team.id;
            return (<option value={team.id} key={key}>{team.name}</option>);
        });
        return (
        <select id="team_id" onChange={this.updateTeamId}>
            {teamOptions}
        </select>
        );
    }
}

const ErrorMessages = ({messages}) => {
  if (messages.length > 0) {
      const messageListElements = messages.map((message, index) => <li key={index}>{message}</li>);
      return (
          <div id="errors" style={errorStyle}>
              <ul>{messageListElements}</ul>
          </div>
      );
  } else {
      return <div id="no_errors"></div>;
  }
};

const SignupMain = () => (<div style={mainStyle}><SignupTitle/><SignupForm/></div>);

ReactDOM.render(<SignupMain/>, document.getElementById('main'));