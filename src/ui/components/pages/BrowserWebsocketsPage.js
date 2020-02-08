// @flow
import React from 'react';
import BrowserTabs from '../BrowserTabs';

type Props = {
  history: 'array',
  location: 'object'
};

export default ({ history, location }: Props) => (
  <div className="pane-container-vertical">
    <div className="pane-fixed">
      <BrowserTabs history={history} location={location} />
    </div>

    <div className="pane-remaining">Websockets!</div>
  </div>
);
