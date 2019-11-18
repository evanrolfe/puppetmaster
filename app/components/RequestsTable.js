import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer } from 'electron';

import StatusTag from './StatusTag';
import KeydownBinder from './KeydownBinder';
import RequestsTableHeader from './RequestsTableHeader';

import SettingsContext from '../lib/SettingsContext';

type Props = {
  requests: 'array',
  selectedRequestId: 'number',
  setSelectedRequestId: 'function',
  order_by: 'string',
  dir: 'string',
  toggleColumnOrder: 'function',
  setScrollTop: 'function',
  scrollTop: 'number',
  isRequestSelected: 'function',
  multipleRequestsSelected: 'function'
};

export default class RequestsTable extends Component<Props> {
  props: Props;

  constructor(props, context) {
    super(props, context);

    this.context = context;

    this.state = { shiftPressed: false };

    this.tableHeaderRefs = {};

    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);
    this.selectPrevRequest = this.selectPrevRequest.bind(this);
    this.selectNextRequest = this.selectNextRequest.bind(this);
    this._setRequestsPanelRef = this._setRequestsPanelRef.bind(this);

    this.requestContextMenus = {};
  }

  componentDidMount() {
    // Restore the scroll state
    const requestPanel = ReactDOM.findDOMNode(this._requestPanel);
    requestPanel.scrollTop = this.props.scrollTop;

    requestPanel.addEventListener('scroll', () => {
      this.props.setScrollTop(requestPanel.scrollTop);
    });

    ipcRenderer.on('deleteRequest', (event, args) => {
      this.deleteRequest(args.requestId);
    });
  }

  componentDidUpdate(prevProps) {
    const prevRequestIds = JSON.stringify(
      prevProps.requests.map(request => request.id).sort()
    );
    const requestIds = JSON.stringify(
      this.props.requests.map(request => request.id).sort()
    );

    if (prevRequestIds !== requestIds) {
      ipcRenderer.send('requestsChanged', { requests: this.props.requests });
    }
  }

  getRowClassName(requestId) {
    if (this.props.isRequestSelected(parseInt(requestId)) === true) {
      return 'selected';
    }
  }

  setTableColumnWidth(columnIndex, width) {
    const newTableColumns = [...this.context.requestsTableColumns];
    newTableColumns[columnIndex].width = width;
    this.context.changeSetting('requestsTableColumns', newTableColumns);
  }

  selectPrevRequest() {
    const currentI = this.props.requests.findIndex(
      request => request.id === this.props.selectedRequestId
    );
    const prevRequest = this.props.requests[currentI - 1];
    if (prevRequest === undefined) return;

    const requestRow = document.getElementById(`requestRow${prevRequest.id}`);
    requestRow.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
      inline: 'start'
    });

    this.props.setSelectedRequestId(prevRequest.id, this.state.shiftPressed);
  }

  selectNextRequest() {
    const currentI = this.props.requests.findIndex(
      request => request.id === this.props.selectedRequestId
    );
    const nextRequest = this.props.requests[currentI + 1];
    if (nextRequest === undefined) return;

    const requestRow = document.getElementById(`requestRow${nextRequest.id}`);
    requestRow.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
      inline: 'start'
    });

    this.props.setSelectedRequestId(nextRequest.id, this.state.shiftPressed);
  }

  async _handleKeyDown(e) {
    if (!['ArrowUp', 'ArrowDown', 'Shift'].includes(e.key)) return;

    e.preventDefault();

    if (e.key === 'ArrowUp') this.selectPrevRequest();
    if (e.key === 'ArrowDown') this.selectNextRequest();
    if (e.key === 'Shift') {
      console.log(`RequestTable: shift pressed`);
      this.setState({ shiftPressed: true });
    }
  }

  classNameForTableHeader(columnName) {
    if (columnName === this.props.order_by) return 'ordered';

    return '';
  }

  async _handleKeyUp(e) {
    if (e.key === 'Shift') {
      this.setState({ shiftPressed: false });
    }
  }

  _setRequestsPanelRef(element) {
    this._requestPanel = element;
  }

  _handleRightClick(requestId, event) {
    event.preventDefault();
    //  && this.props.isRequestSelected(requestId)
    if (this.props.multipleRequestsSelected()) {
      ipcRenderer.send('showMultipleRequestContextMenu', {
        requestId: requestId
      });
    } else {
      ipcRenderer.send('showRequestContextMenu', { requestId: requestId });
    }
  }

  async deleteRequest(requestId) {
    console.log(`Deleteing request ${requestId}`);

    await global.backendConn.send('RequestsController', 'delete', {
      id: requestId
    });
  }

  renderTableCell(column, request) {
    switch (column.key) {
      case 'id':
        return <td>{request.id}</td>;

      case 'method':
        return (
          <td>
            <span className={`http-method-${request.method}`}>
              {request.method}
            </span>
          </td>
        );

      case 'host':
        return <td>{request.host}</td>;

      case 'response_status':
        if (request.response_status === null) {
          return <td>&nbsp;</td>;
        } else {
          return (
            <td>
              <StatusTag statusCode={request.response_status} small />
            </td>
          );
        }

      case 'created_at': {
        const time = new Date(request.created_at);
        return <td>{time.toUTCString()}</td>;
      }

      default:
        return <td>{request[column.key]}</td>;
    }
  }

  render() {
    console.log(`Rendering RequestsTable`);

    const requests = this.props.requests;

    return (
      <KeydownBinder
        stopMetaPropagation
        onKeydown={this._handleKeyDown}
        onKeyup={this._handleKeyUp}
      >
        <div
          className="pane-remaining"
          style={{ overflowX: 'auto' }}
          ref={this._setRequestsPanelRef}
        >
          <table className="requests-table">
            <thead>
              <tr>
                {this.context.requestsTableColumns.map((column, i) => (
                  <RequestsTableHeader
                    key={`RequestsTableHeader${i}`}
                    onClick={this.props.toggleColumnOrder.bind(
                      this,
                      column.key
                    )}
                    className={this.classNameForTableHeader(column.key)}
                    orderDir={this.props.dir}
                    width={column.width}
                    setTableColumnWidth={this.setTableColumnWidth.bind(this)}
                    columnIndex={i}
                    minWidth={column.minWidth}
                  >
                    {column.title}
                  </RequestsTableHeader>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr
                  key={request.id}
                  id={`requestRow${request.id}`}
                  onClick={() =>
                    this.props.setSelectedRequestId(
                      request.id,
                      this.state.shiftPressed
                    )
                  }
                  onContextMenu={this._handleRightClick.bind(this, request.id)}
                  className={this.getRowClassName(request.id)}
                >
                  {this.context.requestsTableColumns.map(column =>
                    this.renderTableCell(column, request)
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </KeydownBinder>
    );
  }
}

RequestsTable.contextType = SettingsContext;
