// @flow
import React, { Component } from 'react';
import BrowserTabs from '../BrowserTabs';

type Props = {
  history: 'array',
  location: 'object'
};

export default class BrowserInterceptPage extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className="pane-container-vertical">
        <div className="pane-fixed">
          <BrowserTabs
            history={this.props.history}
            location={this.props.location}
          />
        </div>

        <div className="pane-remaining">Browser Intercept!</div>
      </div>
    );
  }
}
