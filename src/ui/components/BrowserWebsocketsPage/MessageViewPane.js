import React from 'react';
import { Tab, TabList, Tabs } from 'react-tabs';

import PaneContainer from '../pane/PaneContainer';
import PaneFixed from '../pane/PaneFixed';
import PaneRemaining from '../pane/PaneRemaining';

type Props = {
  websocketMessage: 'object'
};

export default ({ websocketMessage }: Props) => {
  console.log(websocketMessage);

  return (
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

      <PaneRemaining>
        {websocketMessage !== null && websocketMessage.body}
      </PaneRemaining>
    </PaneContainer>
  );
};
