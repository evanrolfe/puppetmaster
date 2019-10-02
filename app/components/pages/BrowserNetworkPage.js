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

    this.state = {
      browserNetworkPaneHeight: 250,
      draggingPaneVertical: false,
      showDragOverlay: false
    };

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
  }

  componentDidMount() {
    document.addEventListener('mouseup', this._handleMouseUp);
    // TODO: Throttle this event callback
    document.addEventListener('mousemove', this._handleMouseMove);
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
