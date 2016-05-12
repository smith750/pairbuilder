import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const server = 'http://localhost:3000';

class SignupTitle extends React.Component {
    constructor() {
        super();
        this.state = {currentEvent: {}}
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

const SignupMain = () => (<div><SignupTitle/></div>);

ReactDOM.render(<SignupMain/>, document.getElementById('main'));