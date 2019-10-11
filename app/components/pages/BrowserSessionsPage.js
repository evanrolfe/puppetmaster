// @flow
import React, { Component } from 'react';
import BrowserTabs from '../BrowserTabs';

type Props = {
  history: 'array',
  location: 'object'
};

export default class BrowserSessionsPage extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.newBrowser = this.newBrowser.bind(this);
  }

  newBrowser() {
    global.backendConn.send('BrowsersController', 'create', {});
  }

  render() {
    return (
      <div className="pane-container-vertical">
        <div className="pane-fixed">
          <BrowserTabs
            history={this.props.history}
            location={this.props.location}
          />
        </div>

        <div className="pane-remaining">
          Browser Sessions!
          <br />
          <a onClick={() => this.newBrowser()}>Open a new browser</a>
        </div>
      </div>
    );
  }
}
