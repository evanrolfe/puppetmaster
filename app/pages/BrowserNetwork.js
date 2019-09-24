// @flow
import React, { Component } from 'react';
import RequestsTable from '../components/RequestsTable';
import RequestView from '../components/RequestView';

type Props = {};

export default class BrowserNetwork extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = { selectedRequestId: 33 };

    this.setSelectedRequestId = this.setSelectedRequestId.bind(this);
  }

  setSelectedRequestId(id) {
    const newState = Object.assign({}, this.state);
    newState.selectedRequestId = id;
    this.setState(newState);
  }

  render() {
    return (
      <>
        <div className="requests-table-pane">
          <RequestsTable
            selectedRequestId={this.state.selectedRequestId}
            setSelectedRequestId={this.setSelectedRequestId}
          />
        </div>

        <div className="requests-view-pane">
          <RequestView selectedRequestId={this.state.selectedRequestId} />
        </div>
      </>
    );
  }
}
