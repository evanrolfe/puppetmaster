// @flow
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { remote } from 'electron';

import BrowserTabs from '../BrowserTabs';
import RequestsTable from '../RequestsTable';
import RequestView from '../RequestView';

import SettingsContext from '../../lib/SettingsContext';
import RequestsFilterForm from '../RequestsFilterForm';

type Props = {
  history: 'array',
  location: 'object'
};

const MIN_PANE_WIDTH = 300;
const MIN_PANE_HEIGHT = 150;

export const RESOURCE_TYPES = [
  'document',
  'eventsource',
  'fetch',
  'font',
  'image',
  'manifest',
  'media',
  'navigation',
  'other',
  'stylesheet',
  'script',
  'texttrack',
  'websocket',
  'xhr'
];

export const STATUS_CODES = {
  2: '2xx [Success]',
  3: '3xx [Redirect]',
  4: '4xx [Request Error]',
  5: '5xx [Server Error]'
};

export const ALL_TABLE_COLUMNS = [
  { key: 'id', title: '#', width: 40 },
  { key: 'title', title: 'Browser', width: 100 },
  { key: 'method', title: 'Method', width: 70 },
  { key: 'host', title: 'Host', width: 100 },
  { key: 'path', title: 'Path', width: 200 },
  { key: 'request_type', title: 'Type', width: 100 },
  { key: 'ext', title: 'Ext', width: 40 },
  { key: 'response_status', title: 'Status', width: 70 },
  {
    key: 'response_body_length',
    title: 'Length',
    width: 70
  },
  {
    key: 'response_remote_address',
    title: 'IP Address',
    width: 130
  },
  { key: 'created_at', title: 'Time', width: 200 }
];

export default class BrowserNetworkPage extends Component<Props> {
  props: Props;

  constructor(props, context) {
    super(props, context);

    this.context = context;

    if (global.browserNetworkPageState === undefined) {
      this.state = {
        // Persistant state:
        paneWidth: this.context.settings.paneWidth,
        paneHeight: this.context.settings.paneHeight,

        // Volatile state(?):
        draggingPane: false,
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
          extList: [],
          search: ''
        },
        windowSize: remote.getCurrentWindow().getSize(),
        requestViewTabIndex: 0
      };
    } else {
      this.state = global.browserNetworkPageState;
    }

    this.setSelectedRequestId = this.setSelectedRequestId.bind(this);
    this.handleStartDragPane = this.handleStartDragPane.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._setRequestTableRef = this._setRequestTableRef.bind(this);
    this.toggleColumnOrder = this.toggleColumnOrder.bind(this);
    this.setTableColumnWidth = this.setTableColumnWidth.bind(this);
    this.setScrollTop = this.setScrollTop.bind(this);
    this.setFilters = this.setFilters.bind(this);
    this.getCodeMirrorWidth = this.getCodeMirrorWidth.bind(this);
    this.setRequestViewTabIndex = this.setRequestViewTabIndex.bind(this);
    this.setSearch = this.setSearch.bind(this);

    this.throttledHandleMouseMove = _.throttle(
      this.handleMouseMove.bind(this),
      50
    );

    this.throttledSetWindowSizeState = _.throttle(() => {
      this.setState({ windowSize: remote.getCurrentWindow().getSize() });
    }, 200);

    global.backendConn.listen('requestCreated', () => {
      this.loadRequests();
    });
  }

  componentDidMount() {
    document.addEventListener('mouseup', this._handleMouseUp);
    document.addEventListener('mousemove', this.throttledHandleMouseMove);
    window.addEventListener('resize', this.throttledSetWindowSizeState);

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
      this.state.dir !== prevState.dir ||
      this.state.filters.search !== prevState.filters.search ||
      this.state.filters.hostSetting !== prevState.filters.hostSetting ||
      this.state.filters.pathSetting !== prevState.filters.pathSetting ||
      this.state.filters.extSetting !== prevState.filters.extSetting ||
      JSON.stringify(this.state.filters.pathList) !==
        JSON.stringify(prevState.filters.pathList) ||
      JSON.stringify(this.state.filters.hostList) !==
        JSON.stringify(prevState.filters.hostList) ||
      JSON.stringify(this.state.filters.extList) !==
        JSON.stringify(prevState.filters.extList) ||
      JSON.stringify(this.state.filters.resourceTypes) !==
        JSON.stringify(prevState.filters.resourceTypes) ||
      JSON.stringify(this.state.filters.statusCodes) !==
        JSON.stringify(prevState.filters.statusCodes)
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
      {
        order_by: this.state.order_by,
        dir: this.state.dir,
        hostSetting: this.state.filters.hostSetting,
        hostList: this.state.filters.hostList,
        pathSetting: this.state.filters.pathSetting,
        pathList: this.state.filters.pathList,
        extSetting: this.state.filters.extSetting,
        extList: this.state.filters.extList,
        resourceTypes: this.state.filters.resourceTypes,
        statusCodes: this.state.filters.statusCodes,
        search: this.state.filters.search
      }
    );

    this.setState({ requests: response.result.body });
    /* eslint-enable */
  }

  setSelectedRequestId(id) {
    const newState = Object.assign({}, this.state);
    newState.selectedRequestId = id;
    this.setState(newState);
  }

  orientation() {
    return this.context.settings.browserNetworkOrientation;
  }

  tableColumns() {
    return this.context.settings.requestsTableColumns;
  }

  // NOTE: The root div in this component needs to have a css class of
  // pane-container-<inverseOrientation()>.
  inverseOrientation() {
    return this.orientation() === 'vertical' ? 'horizontal' : 'vertical';
  }

  handleMouseMove(e) {
    if (this.state.draggingPane) {
      this.setState(prevState => {
        const requestTable = ReactDOM.findDOMNode(this._requestTable);

        let diff;

        if (this.orientation() === 'horizontal') {
          diff = e.clientY - requestTable.offsetTop - requestTable.offsetHeight;
        } else if (this.orientation() === 'vertical') {
          diff = e.clientX - requestTable.offsetLeft - requestTable.offsetWidth;
        }

        if (this.orientation() === 'horizontal') {
          const paneHeight = prevState.paneHeight + diff;

          if (paneHeight < MIN_PANE_HEIGHT) return;

          return { paneHeight: paneHeight };
        }

        if (this.orientation() === 'vertical') {
          const paneWidth = prevState.paneWidth + diff;

          if (paneWidth < MIN_PANE_WIDTH) return;

          return { paneWidth: paneWidth };
        }
      });
    }
  }

  _handleMouseUp() {
    if (this.state.draggingPane) {
      this.setState({ draggingPane: false });
      // Save the pane to the settings
      if (this.orientation() === 'vertical') {
        this.context.changeSetting('paneWidth', this.state.paneWidth);
      } else if (this.orientation() === 'horizontal') {
        this.context.changeSetting('paneHeight', this.state.paneHeight);
      }
    }
  }

  handleStartDragPane() {
    this.setState({ draggingPane: true });
  }

  _setRequestTableRef(element) {
    this._requestTable = element;
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
    const newTableColumns = [...this.tableColumns()];
    newTableColumns[columnIndex].width = width;
    this.context.changeSetting('requestsTableColumns', newTableColumns);
  }

  setScrollTop(scrollTop) {
    this.setState({ requestsTableScrollTop: scrollTop });
  }

  setFilters(filters) {
    this.setState({ filters: filters });
  }

  setSearch(searchTerm) {
    this.setState(prevState => {
      const newFilters = Object.assign({}, prevState.filters);
      newFilters.search = searchTerm;
      return { filters: newFilters };
    });
  }

  getCodeMirrorWidth() {
    let codeMirrorWidth;
    const windowWidth = this.state.windowSize[0];
    const sideBarWidth = 53;

    if (this.orientation() === 'horizontal') {
      codeMirrorWidth = windowWidth - sideBarWidth;
    } else if (this.orientation() === 'vertical') {
      codeMirrorWidth = windowWidth - sideBarWidth - this.state.paneWidth;
    }

    return codeMirrorWidth;
  }

  setRequestViewTabIndex(tabIndex) {
    this.setState({ requestViewTabIndex: tabIndex });
  }

  render() {
    const filters = JSON.parse(JSON.stringify(this.state.filters));

    const paneStyle = {};

    if (this.orientation() === 'horizontal') {
      paneStyle.height = this.state.paneHeight;
    } else if (this.orientation() === 'vertical') {
      paneStyle.width = this.state.paneWidth;
    }

    return (
      <>
        <div className={`pane-container-${this.inverseOrientation()}`}>
          <div className="pane-fixed pane-container-vertical" style={paneStyle}>
            <div className="pane-fixed">
              <BrowserTabs
                history={this.props.history}
                location={this.props.location}
              />
            </div>

            <div
              className="pane-fixed"
              style={{ marginLeft: '10px', padding: '6px' }}
            >
              <RequestsFilterForm
                allStatusCodes={STATUS_CODES}
                allResourceTypes={RESOURCE_TYPES}
                filters={filters}
                setFilters={this.setFilters}
                setSearch={this.setSearch}
              />
            </div>

            <RequestsTable
              tableColumns={this.tableColumns()}
              selectedRequestId={this.state.selectedRequestId}
              setSelectedRequestId={this.setSelectedRequestId}
              paneHeight={this.state.browserNetworkPaneHeight}
              ref={this._setRequestTableRef}
              showTransition={this.state.draggingPane}
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
            className="pane-border pane-fixed"
            onMouseDown={this.handleStartDragPane}
          >
            <div className="pane-border-transparent" />
          </div>

          <RequestView
            selectedRequestId={this.state.selectedRequestId}
            codeMirrorWidth={this.getCodeMirrorWidth()}
            draggingPane={this.state.draggingPane}
            tabIndex={this.state.requestViewTabIndex}
            setRequestViewTabIndex={this.setRequestViewTabIndex}
          />
        </div>
      </>
    );
  }
}

BrowserNetworkPage.contextType = SettingsContext;
