// @flow
import React, { Component } from 'react';

type Props = {};

export default class BrowserNetwork extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    console.log(`BrowserNetwork.constructor`);
    this.state = { requests: [] };
    this.fetchRequests();

    setInterval(() => {
      this.fetchRequests();
    }, 1000);
  }

  componentDidMount() {
    this.fetchRequests();
  }

  async fetchRequests() {
    console.log(`Fetching requests...`);
    const response = await global.backendConn.send('GET', '/requests', {});
    const requests = response.result.body;

    if (requests.length !== this.state.requests.length) {
      const newState = Object.assign({}, this.state);
      newState.requests = requests;
      this.setState(newState);
    }
  }

  render() {
    const requests = this.state.requests;

    return (
      <div>
        <h2>Requests</h2>

        <ul>
          {requests.map(request => (
            <li key={request.id}>
              {request.method} {request.url}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
