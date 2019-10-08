// @flow
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import RequestsTable from '../RequestsTable';
import RequestView from '../RequestView';

import { registerModal, showModal } from '../modals/index';
import DisplayFiltersModal from '../modals/DisplayFiltersModal';

type Props = {
  windowSize: 'array'
};

const RESOURCE_TYPES = [
  'document',
  'fetch',
  'manifest',
  'other',
  'script',
  'stylesheet',
  'xhr'
];

const STATUS_CODES = {
  200: '2xx [Success]',
  300: '3xx [Redirect]',
  400: '4xx [Request Error]',
  500: '5xx [Server Error]'
};

export default class BrowserNetworkPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);

    if (global.browserNetworkPageState === undefined) {
      this.state = {
        draggingPaneVertical: false,
        showDragOverlay: false,
        browserNetworkPaneHeight: 250,
        // RequestTable state:
        tableColumns: [
          { key: 'id', title: '#', minWidth: 40, width: 40 },
          { key: 'method', title: 'Method', minWidth: 70, width: 70 },
          { key: 'host', title: 'Host', minWidth: 200, width: 200 },
          { key: 'path', title: 'Path', minWidth: 250, width: 250 },
          { key: 'request_type', title: 'Type', minWidth: 75, width: 75 },
          { key: 'ext', title: 'Ext', minWidth: 40, width: 40 },
          { key: 'response_status', title: 'Status', minWidth: 60, width: 70 },
          {
            key: 'response_body_length',
            title: 'Length',
            minWidth: 65,
            width: 70
          },
          {
            key: 'response_remote_address',
            title: 'IP Address',
            minWidth: 120,
            width: 130
          },
          { key: 'created_at', title: 'Time' }
        ],
        order_by: 'id',
        dir: 'desc',
        requestsTableScrollTop: 0,
        requests: [],
        filters: {
          hostList: [],
          hostSetting: '', // ''|'include'|'exclude'
          pathList: [],
          pathSetting: '', // ''|'include'|'exclude'
          statusCodes: Object.keys(STATUS_CODES),
          resourceTypes: RESOURCE_TYPES,
          extSetting: '', // ''|'include'|'exclude'
          extList: []
        }
      };
    } else {
      this.state = global.browserNetworkPageState;
    }

    this.setSelectedRequestId = this.setSelectedRequestId.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this.handleStartDragPaneVertical = this.handleStartDragPaneVertical.bind(
      this
    );
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._setRequestTableRef = this._setRequestTableRef.bind(this);
    this.calculateRequestPaneHeight = this.calculateRequestPaneHeight.bind(
      this
    );
    this.toggleColumnOrder = this.toggleColumnOrder.bind(this);
    this.setTableColumnWidth = this.setTableColumnWidth.bind(this);
    this.setScrollTop = this.setScrollTop.bind(this);
    this.setFilters = this.setFilters.bind(this);

    global.backendConn.listen('requestCreated', () => {
      this.loadRequests();
    });
  }

  componentDidMount() {
    document.addEventListener('mouseup', this._handleMouseUp);
    // TODO: Throttle this event callback
    document.addEventListener('mousemove', this._handleMouseMove);

    if (this.state.requests.length === 0) {
      this.loadRequests();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // DO not re-render when only the scroll state changes
    if (
      this.state.requestsTableScrollTop !== nextState.requestsTableScrollTop
    ) {
      return false;
    }

    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.order_by !== prevState.order_by ||
      this.state.dir !== prevState.dir
    ) {
      this.loadRequests();
    }
  }

  componentWillUnmount() {
    global.browserNetworkPageState = this.state;
  }

  async loadRequests() {
    /* eslint-disable */
    const response = await global.backendConn.send(
      'RequestsController',
      'index',
      { order_by: this.state.order_by, dir: this.state.dir }
    );

    this.setState({ requests: response.result.body });
    /* eslint-enable */
  }

  setSelectedRequestId(id) {
    const newState = Object.assign({}, this.state);
    newState.selectedRequestId = id;
    this.setState(newState);
  }

  _handleMouseMove(e) {
    if (this.state.draggingPaneVertical) {
      this.setState({ showDragOverlay: true });

      const requestTable = ReactDOM.findDOMNode(this._requestTable);
      const newHeight =
        e.clientY - requestTable.offsetTop - requestTable.offsetHeight;

      this.setState({ browserNetworkPaneHeight: newHeight });
    }
  }

  _handleMouseUp() {
    if (this.state.draggingPaneVertical) {
      this.setState({ draggingPaneVertical: false, showDragOverlay: false });
    }
  }

  handleStartDragPaneVertical() {
    this.setState({ draggingPaneVertical: true });
  }

  _setRequestTableRef(element) {
    this._requestTable = element;
  }

  calculateRequestPaneHeight() {
    const windowHeight = this.props.windowSize[1];
    // TODO: Get rid of this stupid static height (212) and use proper css to ensure that the request
    //       view carreis on to the bottom of the page.
    // NOTE: 77 is the height of the search+filter div
    return windowHeight - this.state.browserNetworkPaneHeight - 186 - 77;
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
      const tableColumns = [...prevState.tableColumns];
      tableColumns[columnIndex].width = width;

      return { tableColumns: tableColumns };
    });
  }

  setScrollTop(scrollTop) {
    this.setState({ requestsTableScrollTop: scrollTop });
  }

  setFilters(filters) {
    this.setState({ filters: filters });
  }

  render() {
    const filters = JSON.parse(JSON.stringify(this.state.filters));

    return (
      <>
        <div className="requests-table-pane">
          {this.state.showDragOverlay ? (
            <div className="blocker-overlay" />
          ) : null}

          <DisplayFiltersModal
            ref={registerModal}
            allStatusCodes={STATUS_CODES}
            allResourceTypes={RESOURCE_TYPES}
            origFilters={filters}
            setFilters={this.setFilters}
          />

          <div style={{ marginLeft: '10px', padding: '6px', width: '' }}>
            <div
              className="form-control form-control--outlined"
              style={{
                width: '70%',
                maxWidth: '800px',
                display: 'inline-block'
              }}
            >
              <label>Search:</label>
              <input
                type="text"
                style={{ width: '100%' }}
                placeholder="Enter search term"
              />
            </div>

            <div
              className="form-control form-control--outlined"
              style={{ width: '30%', display: 'inline-block' }}
            >
              <label style={{ marginLeft: '10px' }}>Filters:</label>

              <button
                className="pointer btn btn--outlined btn--super-compact"
                style={{ marginLeft: '10px', display: 'inline-block' }}
                onClick={() => showModal(DisplayFiltersModal)}
              >
                Display
              </button>
              <button
                className="pointer btn btn--outlined btn--super-compact"
                style={{ marginLeft: '10px', display: 'inline-block' }}
              >
                Capture (3)
              </button>
            </div>
          </div>

          <RequestsTable
            tableColumns={this.state.tableColumns}
            selectedRequestId={this.state.selectedRequestId}
            setSelectedRequestId={this.setSelectedRequestId}
            paneHeight={this.state.browserNetworkPaneHeight}
            ref={this._setRequestTableRef}
            showTransition={this.state.draggingPaneVertical}
            order_by={this.state.order_by}
            dir={this.state.dir}
            toggleColumnOrder={this.toggleColumnOrder}
            setTableColumnWidth={this.setTableColumnWidth}
            scrollTop={this.state.requestsTableScrollTop}
            setScrollTop={this.setScrollTop}
            requests={this.state.requests}
          />
        </div>

        <div
          className="resizable-border"
          onMouseDown={this.handleStartDragPaneVertical}
        >
          <div className="resizable-border-transparent" />
        </div>

        <div className="requests-view-pane">
          <RequestView
            selectedRequestId={this.state.selectedRequestId}
            panelHeight={this.calculateRequestPaneHeight()}
          />
        </div>
      </>
    );
  }
}
