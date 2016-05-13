import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const server = 'http://localhost:3000';

class SignupTitle extends React.Component {
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

    render() {
        if (Object.keys(this.state.currentEvent).length > 0) {
            return (<div>Sign Up for {this.state.currentEvent.name}</div>)
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
                <div id="success">
                    {this.state.message}
                </div>
            );
        } else {
            return (
                <div id="signup-form">
                    <ErrorMessages messages={this.state.error_messages}/>
                    <div><label htmlFor="name">Name:</label><input type="text" id="name" size="40"
                                                                   onChange={this.updateName}/></div>
                    <div><label htmlFor="team_id">Team:</label><TeamDropDown onUpdate={this.updateTeamId}/></div>
                    <div>
                        <button onClick={this.addParticipant}>Register!</button>
                    </div>
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
          <div id="errors">
              <ul>{messageListElements}</ul>
          </div>
      );
  } else {
      return <div id="no_errors"></div>;
  }
};

const SignupMain = () => (<div><SignupTitle/><SignupForm/></div>);

ReactDOM.render(<SignupMain/>, document.getElementById('main'));