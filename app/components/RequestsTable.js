import React, { Component } from 'react';
import StatusTag from './StatusTag';

type Props = {
  selectedRequestId: 'number',
  setSelectedRequestId: 'function'
};

export default class RequestsTable extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      requests: [],
      tableColumnSizes: [24, 100, 500, 100]
    };
    this.loadRequests();
  }

  componentDidMount() {
    this.loadRequests();
  }

  async loadRequests() {
    console.log(`Fetching requests...`);
    const response = await global.backendConn.send('GET', '/requests', {});
    const requests = response.result.body;

    if (requests.length !== this.state.requests.length) {
      const newState = Object.assign({}, this.state);
      newState.requests = requests;
      this.setState(newState);
    }
  }

  getRowClassName(requestId) {
    if (parseInt(this.props.selectedRequestId) === parseInt(requestId)) {
      return 'selected';
    }
  }

  render() {
    const requests = this.state.requests;

    return (
      <>
        <div style={{ marginLeft: '10px', padding: '6px' }}>Filters</div>

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
                <tr
                  key={request.id}
                  onClick={() => this.props.setSelectedRequestId(request.id)}
                  className={this.getRowClassName(request.id)}
                >
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
                    <StatusTag statusCode={request.response_status} small />
                  </td>
                  <td>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }
}
