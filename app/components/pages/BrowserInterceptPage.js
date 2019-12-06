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
  interceptCommand: 'function',
  interceptEnabled: 'boolean',
  toggleIntercept: 'function'
};

export default ({
  request,
  interceptCommand,
  interceptEnabled,
  toggleIntercept,
  history,
  location
}: Props) => {
  const buttonsDisabled = request === null;

  let requestTitle;

  if (request !== null) {
    requestTitle = (
      <>
        <span className={`http-method-${request.method}`}>
          {request.method}
        </span>
        &nbsp;{request.url}
      </>
    );
  }

  return (
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
          {requestTitle}
        </div>

        <div
          className="form-control form-control--outlined"
          style={{ width: '100%', display: 'inline-block' }}
        >
          <button
            className="pointer btn btn--outlined btn--super-compact"
            style={{ display: 'inline-block' }}
            onClick={() => interceptCommand('forward')}
            disabled={buttonsDisabled}
          >
            <i className="fas fa-arrow-right" />
            &nbsp; Forward
          </button>
          <button
            className="pointer btn btn--outlined btn--super-compact"
            style={{ marginLeft: '10px', display: 'inline-block' }}
            onClick={() => interceptCommand('forwardAndIntercept')}
            disabled={buttonsDisabled}
          >
            <i className="fas fa-exchange-alt" />
            &nbsp; Forward & Intercept Response
          </button>
          <button
            className="pointer btn btn--outlined btn--super-compact"
            style={{ marginLeft: '10px', display: 'inline-block' }}
            onClick={() => interceptCommand('drop')}
            disabled={buttonsDisabled}
          >
            <i className="fas fa-times" />
            &nbsp; Drop
          </button>
          <button
            className="pointer btn btn--outlined btn--super-compact"
            style={{ marginLeft: '10px', display: 'inline-block' }}
            onClick={toggleIntercept}
          >
            <i className="fas fa-power-off" />
            &nbsp;
            {interceptEnabled ? 'Disable Intercept' : 'Enable Intercept'}
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
};
