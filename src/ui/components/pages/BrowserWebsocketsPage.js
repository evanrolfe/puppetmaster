// @flow
import React from 'react';
import { Tab, TabList, Tabs } from 'react-tabs';

import BrowserTabs from '../BrowserTabs';
import PaneContainer from '../pane/PaneContainer';
import PaneRemaining from '../pane/PaneRemaining';
import PaneFixed from '../pane/PaneFixed';
import PaneResizeableState from '../BrowserNetworkPage/PaneResizeableState';

type Props = {
  history: 'array',
  location: 'object'
};

export default ({ history, location }: Props) => (
  <PaneContainer orientation="horizontal">
    <PaneResizeableState paneId={1} pageName="browserWebsocketsPage">
      <PaneContainer orientation="vertical">
        <PaneFixed>
          <BrowserTabs history={history} location={location} />
        </PaneFixed>

        <PaneFixed style={{ marginLeft: '10px', padding: '6px' }}>
          <div className="pane-control">
            <div
              className="form-control form-control--outlined"
              style={{
                width: '60%',
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
          </div>
        </PaneFixed>

        <PaneRemaining>The remaining pane!</PaneRemaining>
      </PaneContainer>
    </PaneResizeableState>

    <PaneRemaining>
      <PaneContainer orientation="vertical">
        <PaneFixed>
          <Tabs className="theme--pane__body react-tabs" selectedIndex={0}>
            <TabList>
              <Tab>
                <button type="button">Message</button>
              </Tab>
            </TabList>
          </Tabs>
        </PaneFixed>
        Hello world
      </PaneContainer>
    </PaneRemaining>
  </PaneContainer>
);
