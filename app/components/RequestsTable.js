import React, { Component } from 'react';
import StatusTag from './StatusTag';
import KeydownBinder from './KeydownBinder';
import RequestsTableHeader from './RequestsTableHeader';

type Props = {
  selectedRequestId: 'number',
  setSelectedRequestId: 'function',
  paneHeight: 'number',
  showTransition: 'boolean'
};

export default class RequestsTable extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      requests: [],
      tableColumnWidths: [100, 100, 500, 100],
      order_by: 'response_status',
      dir: 'asc'
    };
    this.loadRequests();
    this.tableHeaderRefs = {};

    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.selectPrevRequest = this.selectPrevRequest.bind(this);
    this.selectNextRequest = this.selectNextRequest.bind(this);
  }

  componentDidMount() {
    this.loadRequests();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.order_by !== prevState.order_by ||
      this.state.dir !== prevState.dir
    ) {
      this.loadRequests();
    }
  }

  async loadRequests() {
    const url = `/requests?order_by=${this.state.order_by}&dir=${
      this.state.dir
    }`;
    const response = await global.backendConn.send('GET', url, {});
    const requests = response.result.body;

    const newState = Object.assign({}, this.state);
    newState.requests = requests;
    this.setState(newState);
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
      behavior: 'auto',
      block: 'nearest',
      inline: 'start'
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
      behavior: 'auto',
      block: 'nearest',
      inline: 'start'
    });

    this.props.setSelectedRequestId(nextRequest.id);
  }

  async _handleKeyDown(e) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

    e.preventDefault();

    if (e.key === 'ArrowUp') this.selectPrevRequest();
    if (e.key === 'ArrowDown') this.selectNextRequest();
  }

  classNameForTableHeader(columnName) {
    if (columnName === this.state.order_by) return 'ordered';

    return '';
  }

  toggleColumnOrder(columnName) {
    const newState = Object.assign({}, this.state);

    if (columnName !== this.state.order_by) {
      newState.order_by = columnName;
    } else {
      newState.dir = this.state.dir === 'asc' ? 'desc' : 'asc';
    }

    this.setState(newState);
  }

  setTableColumnWidth(columnIndex, width) {
    this.setState(prevState => {
      const tableColumnWidths = [...prevState.tableColumnWidths];
      tableColumnWidths[columnIndex] = width;

      return { tableColumnWidths: tableColumnWidths };
    });
  }

  render() {
    const requests = this.state.requests;

    return (
      <KeydownBinder stopMetaPropagation onKeydown={this._handleKeyDown}>
        <div style={{ marginLeft: '10px', padding: '6px' }}>Filters</div>

        <table className="header-table">
          <thead>
            <tr>
              <RequestsTableHeader
                onClick={this.toggleColumnOrder.bind(this, 'id')}
                className={this.classNameForTableHeader('id')}
                orderDir={this.state.dir}
                width={this.state.tableColumnWidths[0]}
                setTableColumnWidth={this.setTableColumnWidth.bind(this)}
                columnIndex={0}
              >
                #
              </RequestsTableHeader>
              <RequestsTableHeader
                onClick={this.toggleColumnOrder.bind(this, 'method')}
                className={this.classNameForTableHeader('method')}
                orderDir={this.state.dir}
                width={this.state.tableColumnWidths[1]}
                setTableColumnWidth={this.setTableColumnWidth.bind(this)}
                columnIndex={1}
                minWidth={40} // NOTE: This is the min for the previous column
              >
                Method
              </RequestsTableHeader>
              <RequestsTableHeader
                onClick={this.toggleColumnOrder.bind(this, 'url')}
                className={this.classNameForTableHeader('url')}
                orderDir={this.state.dir}
                width={this.state.tableColumnWidths[2]}
                setTableColumnWidth={this.setTableColumnWidth.bind(this)}
                columnIndex={2}
                minWidth={70}
              >
                URL
              </RequestsTableHeader>
              <RequestsTableHeader
                onClick={this.toggleColumnOrder.bind(this, 'response_status')}
                className={this.classNameForTableHeader('response_status')}
                orderDir={this.state.dir}
                width={this.state.tableColumnWidths[3]}
                setTableColumnWidth={this.setTableColumnWidth.bind(this)}
                columnIndex={3}
                minWidth={435}
              >
                Status
              </RequestsTableHeader>
              <RequestsTableHeader
                width={this.state.tableColumnWidths[4]}
                setTableColumnWidth={this.setTableColumnWidth.bind(this)}
                columnIndex={4}
                minWidth={60}
              >
                Length
              </RequestsTableHeader>
            </tr>
          </thead>
        </table>

        {this.props.showTransition && (
          <div style={{ height: `${this.props.paneHeight}px` }} />
        )}

        {!this.props.showTransition && (
          <div
            className="scrollable"
            style={{ height: `${this.props.paneHeight}px` }}
          >
            <table className="requests-table">
              <tbody>
                {requests.map(request => (
                  <tr
                    key={request.id}
                    id={`requestRow${request.id}`}
                    onClick={() => this.props.setSelectedRequestId(request.id)}
                    className={this.getRowClassName(request.id)}
                  >
                    <td width={this.state.tableColumnWidths[0]}>
                      {request.id}
                    </td>
                    <td
                      className={`http-method-${request.method}`}
                      width={this.state.tableColumnWidths[1]}
                    >
                      {request.method}
                    </td>
                    <td width={this.state.tableColumnWidths[2]}>
                      {request.url.substr(0, 60)}
                    </td>
                    <td width={this.state.tableColumnWidths[3]}>
                      <StatusTag statusCode={request.response_status} small />
                    </td>
                    <td>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </KeydownBinder>
    );
  }
}
