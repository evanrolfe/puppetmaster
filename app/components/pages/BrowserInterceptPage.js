// @flow
import React from 'react';
import { Tab, TabList, Tabs } from 'react-tabs';

import BrowserTabs from '../BrowserTabs';
import PaneContainer from '../pane/PaneContainer';
import PaneRemaining from '../pane/PaneRemaining';
import PaneFixed from '../pane/PaneFixed';

type Props = {
  request: 'object',
  history: 'array',
  location: 'object',
  forwardRequest: 'function'
};

export default ({ request, forwardRequest, history, location }: Props) => (
  <PaneContainer orientation="vertical">
    <PaneFixed>
      <BrowserTabs history={history} location={location} />
    </PaneFixed>

    <PaneFixed
      className="pane-border-bottom"
      style={{ marginLeft: '10px', padding: '6px' }}
    >
      <div style={{ marginTop: 0 }}>
        Request to: &nbsp;
        <span className={`http-method-${request.method}`}>
          {request.method}
        </span>
        &nbsp;{request.url}
      </div>

      <div
        className="form-control form-control--outlined"
        style={{ width: '40%', display: 'inline-block' }}
      >
        <button
          className="pointer btn btn--outlined btn--super-compact"
          style={{ display: 'inline-block' }}
          onClick={forwardRequest}
        >
          Forward
        </button>
        <button
          className="pointer btn btn--outlined btn--super-compact"
          style={{ marginLeft: '10px', display: 'inline-block' }}
        >
          Drop
        </button>
        <button
          className="pointer btn btn--outlined btn--super-compact"
          style={{ marginLeft: '10px', display: 'inline-block' }}
        >
          Disable Intercept
        </button>
      </div>
    </PaneFixed>

    <PaneFixed>
      <Tabs className="theme--pane__body react-tabs" selectedIndex={0}>
        <TabList>
          <Tab>
            <button type="button">Raw</button>
          </Tab>
          <Tab>
            <button type="button">Headers</button>
          </Tab>
          <Tab>
            <button type="button">Body</button>
          </Tab>
        </TabList>
      </Tabs>
    </PaneFixed>
    <PaneRemaining>Request body goes here.</PaneRemaining>
  </PaneContainer>
);
