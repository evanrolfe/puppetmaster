import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { remote } from 'electron';

import StatusTag from './StatusTag';
import KeydownBinder from './KeydownBinder';
import RequestsTableHeader from './RequestsTableHeader';

type Props = {
  requests: 'array',
  selectedRequestId: 'number',
  setSelectedRequestId: 'function',
  order_by: 'string',
  dir: 'string',
  toggleColumnOrder: 'function',
  setTableColumnWidth: 'function',
  setScrollTop: 'function',
  scrollTop: 'number',
  tableColumns: 'array'
};

export default class RequestsTable extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);

    this.tableHeaderRefs = {};

    this._handleKeyDown = this._handleKeyDown.bind(this);
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
  }

  componentWillUpdate(prevProps) {
    if (
      prevProps.requests.map(request => request.id) !==
      this.props.requests.map(request => request.id)
    ) {
      this.props.requests.forEach(request => {
        const menu = new remote.Menu();
        const menuItem = new remote.MenuItem({
          label: 'Delete',
          click: this.deleteRequest.bind(this, request.id)
        });
        menu.append(menuItem);
        this.requestContextMenus[request.id] = menu;
      });
    }
  }

  getRowClassName(requestId) {
    if (parseInt(this.props.selectedRequestId) === parseInt(requestId)) {
      return 'selected';
    }
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

    this.props.setSelectedRequestId(prevRequest.id);
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

  _handleRightClick(requestId, event) {
    event.preventDefault();
    this.requestContextMenus[requestId].popup({
      window: remote.getCurrentWindow()
    });
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
    const requests = this.props.requests;

    return (
      <KeydownBinder stopMetaPropagation onKeydown={this._handleKeyDown}>
        <div
          className="pane-remaining"
          style={{ overflowX: 'auto' }}
          ref={this._setRequestsPanelRef}
        >
          <table className="requests-table">
            <thead>
              <tr>
                {this.props.tableColumns.map((column, i) => (
                  <RequestsTableHeader
                    key={`RequestsTableHeader${i}`}
                    onClick={this.props.toggleColumnOrder.bind(
                      this,
                      column.key
                    )}
                    className={this.classNameForTableHeader(column.key)}
                    orderDir={this.props.dir}
                    width={column.width}
                    setTableColumnWidth={this.props.setTableColumnWidth.bind(
                      this
                    )}
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
                  onClick={() => this.props.setSelectedRequestId(request.id)}
                  onContextMenu={this._handleRightClick.bind(this, request.id)}
                  className={this.getRowClassName(request.id)}
                >
                  {this.props.tableColumns.map(column =>
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
