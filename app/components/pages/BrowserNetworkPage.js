// @flow
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import RequestsTable from '../RequestsTable';
import RequestView from '../RequestView';

type Props = {
  windowSize: 'array'
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
        tableColumnWidths: [40, 100, 500, 100],
        order_by: 'id',
        dir: 'desc',
        requestsTableScrollTop: 0,
        requests: []
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
    const url = `/requests?order_by=${this.state.order_by}&dir=${
      this.state.dir
    }`;
    const response = await global.backendConn.send('GET', url, {});

    this.setState({ requests: response.result.body });
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
    return windowHeight - this.state.browserNetworkPaneHeight - 212;
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

  setScrollTop(scrollTop) {
    this.setState({ requestsTableScrollTop: scrollTop });
  }

  render() {
    return (
      <>
        <div className="requests-table-pane">
          {this.state.showDragOverlay ? (
            <div className="blocker-overlay" />
          ) : null}

          <RequestsTable
            selectedRequestId={this.state.selectedRequestId}
            setSelectedRequestId={this.setSelectedRequestId}
            paneHeight={this.state.browserNetworkPaneHeight}
            ref={this._setRequestTableRef}
            showTransition={this.state.draggingPaneVertical}
            order_by={this.state.order_by}
            dir={this.state.dir}
            toggleColumnOrder={this.toggleColumnOrder}
            tableColumnWidths={this.state.tableColumnWidths}
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
