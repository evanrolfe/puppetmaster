import React from 'react';
import { Tab, TabList, Tabs } from 'react-tabs';

import PaneContainer from '../pane/PaneContainer';
import PaneFixed from '../pane/PaneFixed';

export default () => (
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
  </PaneContainer>
);
