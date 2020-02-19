// @flow
import React from 'react';

import BrowserTabs from './BrowserNetworkPage/BrowserTabs';
import PaneContainer from '../pane/PaneContainer';
import PaneRemaining from '../pane/PaneRemaining';
import PaneFixed from '../pane/PaneFixed';
import PaneResizeableState from '../pane/PaneResizeableState';
import MessagesTableState from './BrowserWebsocketsPage/MessagesTable/MessagesTableState';
import MessageViewPaneState from './BrowserWebsocketsPage/MessageViewPaneState';
import MessagesSearchFormState from './BrowserWebsocketsPage/MessagesSearchFormState';

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
          <MessagesSearchFormState />
        </PaneFixed>

        <PaneRemaining>
          <MessagesTableState />
        </PaneRemaining>
      </PaneContainer>
    </PaneResizeableState>

    <PaneRemaining>
      <MessageViewPaneState />
    </PaneRemaining>
  </PaneContainer>
);
