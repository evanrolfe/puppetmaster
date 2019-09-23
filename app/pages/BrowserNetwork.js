// @flow
import React, { Component } from 'react';

type Props = {};

export default class BrowserNetwork extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    console.log(`BrowserNetwork.constructor`);
    this.state = {
      requests: [],
      tableColumnSizes: [24, 100, 500, 100]
    };
    this.fetchRequests();
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
      <div className="requests-table-pane">
        <table className="header-table">
          <thead>
            <tr>
              <th width={this.state.tableColumnSizes[0]}>#</th>
              <th className="ordered" width={this.state.tableColumnSizes[1]}>
                Method
                <i className="fas fa-caret-up order-icon" />
              </th>
              <th width={this.state.tableColumnSizes[2]}>URL</th>
              <th width={this.state.tableColumnSizes[3]}>Status</th>
              <th>Length</th>
            </tr>
          </thead>
        </table>

        <div className="scrollable">
          <table className="requests-table">
            <tbody>
              {requests.map(request => (
                <tr key={request.id}>
                  <td width={this.state.tableColumnSizes[0]}>{request.id}</td>
                  <td
                    className={`http-method-${request.method}`}
                    width={this.state.tableColumnSizes[1]}
                  >
                    {request.method}
                  </td>
                  <td width={this.state.tableColumnSizes[2]}>
                    {request.url.substr(0, 60)}
                  </td>
                  <td width={this.state.tableColumnSizes[3]}>
                    {request.response_status}
                  </td>
                  <td>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
