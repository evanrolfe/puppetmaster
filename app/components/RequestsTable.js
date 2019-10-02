import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import StatusTag from './StatusTag';
import KeydownBinder from './KeydownBinder';
import RequestsTableHeader from './RequestsTableHeader';

type Props = {
  selectedRequestId: 'number',
  setSelectedRequestId: 'function',
  paneHeight: 'number',
  showTransition: 'boolean',
  tableColumnWidths: 'array',
  order_by: 'string',
  dir: 'string',
  toggleColumnOrder: 'function',
  setTableColumnWidth: 'function'
};

export default class RequestsTable extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      requests: []
    };
    this.tableHeaderRefs = {};

    this._handleKeyDown = this._handleKeyDown.bind(this);
    this.selectPrevRequest = this.selectPrevRequest.bind(this);
    this.selectNextRequest = this.selectNextRequest.bind(this);
    this._setRequestsPanelRef = this._setRequestsPanelRef.bind(this);
  }

  componentDidMount() {
    this.loadRequests();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.order_by !== prevProps.order_by ||
      this.props.dir !== prevProps.dir
    ) {
      this.loadRequests();
    }
  }

  componentWillUnmount() {
    const requestPanel = ReactDOM.findDOMNode(this._requestPanel);
    console.log(`Scrolled at: ${requestPanel.scrollTop}`);
    // TODO: Save the scroll location
  }

  async loadRequests() {
    const url = `/requests?order_by=${this.props.order_by}&dir=${
      this.props.dir
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
    if (columnName === this.props.order_by) return 'ordered';

    return '';
  }

  _setRequestsPanelRef(element) {
    this._requestPanel = element;
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
                onClick={this.props.toggleColumnOrder.bind(this, 'id')}
                className={this.classNameForTableHeader('id')}
                orderDir={this.props.dir}
                width={this.props.tableColumnWidths[0]}
                setTableColumnWidth={this.props.setTableColumnWidth.bind(this)}
                columnIndex={0}
                minWidth={40}
              >
                #
              </RequestsTableHeader>
              <RequestsTableHeader
                onClick={this.props.toggleColumnOrder.bind(this, 'method')}
                className={this.classNameForTableHeader('method')}
                orderDir={this.props.dir}
                width={this.props.tableColumnWidths[1]}
                setTableColumnWidth={this.props.setTableColumnWidth.bind(this)}
                columnIndex={1}
                minWidth={70}
              >
                Method
              </RequestsTableHeader>
              <RequestsTableHeader
                onClick={this.props.toggleColumnOrder.bind(this, 'url')}
                className={this.classNameForTableHeader('url')}
                orderDir={this.props.dir}
                width={this.props.tableColumnWidths[2]}
                setTableColumnWidth={this.props.setTableColumnWidth.bind(this)}
                columnIndex={2}
                minWidth={435}
              >
                URL
              </RequestsTableHeader>
              <RequestsTableHeader
                onClick={this.props.toggleColumnOrder.bind(
                  this,
                  'response_status'
                )}
                className={this.classNameForTableHeader('response_status')}
                orderDir={this.props.dir}
                width={this.props.tableColumnWidths[3]}
                setTableColumnWidth={this.props.setTableColumnWidth.bind(this)}
                columnIndex={3}
                minWidth={60}
              >
                Status
              </RequestsTableHeader>
              <RequestsTableHeader
                width={this.props.tableColumnWidths[4]}
                noResize
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
            ref={this._setRequestsPanelRef}
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
                    <td width={this.props.tableColumnWidths[0]}>
                      {request.id}
                    </td>
                    <td
                      className={`http-method-${request.method}`}
                      width={this.props.tableColumnWidths[1]}
                    >
                      {request.method}
                    </td>
                    <td width={this.props.tableColumnWidths[2]}>
                      {request.url.substr(0, 60)}
                    </td>
                    <td width={this.props.tableColumnWidths[3]}>
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
