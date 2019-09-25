import React, { Component } from 'react';
import StatusTag from './StatusTag';
import KeydownBinder from './KeydownBinder';

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

    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.selectPrevRequest = this.selectPrevRequest.bind(this);
    this.selectNextRequest = this.selectNextRequest.bind(this);
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

  selectPrevRequest() {
    const currentI = this.state.requests.findIndex(
      request => request.id === this.props.selectedRequestId
    );
    const prevRequest = this.state.requests[currentI - 1];
    if (prevRequest === undefined) return;

    const requestRow = document.getElementById(`requestRow${prevRequest.id}`);
    console.log(requestRow);
    requestRow.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });

    this.props.setSelectedRequestId(prevRequest.id);
  }

  selectNextRequest() {
    const currentI = this.state.requests.findIndex(
      request => request.id === this.props.selectedRequestId
    );
    const nextRequest = this.state.requests[currentI + 1];
    if (nextRequest === undefined) return;

    const requestRow = document.getElementById(`requestRow${nextRequest.id}`);
    console.log(requestRow);
    requestRow.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });

    this.props.setSelectedRequestId(nextRequest.id);
  }

  async _handleKeyDown(e) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

    e.preventDefault();

    if (e.key === 'ArrowUp') this.selectPrevRequest();
    if (e.key === 'ArrowDown') this.selectNextRequest();
  }

  render() {
    const requests = this.state.requests;

    return (
      <KeydownBinder stopMetaPropagation onKeydown={this._handleKeyDown}>
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
                  id={`requestRow${request.id}`}
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
      </KeydownBinder>
    );
  }
}
