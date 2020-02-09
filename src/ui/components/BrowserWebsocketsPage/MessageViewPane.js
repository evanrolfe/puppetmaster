import React from 'react';
import { Tab, TabList, Tabs } from 'react-tabs';

import PaneContainer from '../pane/PaneContainer';
import PaneFixed from '../pane/PaneFixed';
import PaneRemaining from '../pane/PaneRemaining';
import CodeEditor from '../RequestView/CodeEditor';

type Props = {
  websocketMessage: 'object',
  codeMirrorWidth: 'number'
};

export default ({ websocketMessage, codeMirrorWidth }: Props) => {
  console.log(websocketMessage);

  let body;
  if (websocketMessage === null) {
    body = '';
  } else {
    body = websocketMessage.body;
  }

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

      <PaneRemaining style={{ width: `${codeMirrorWidth}px` }}>
        <CodeEditor value={body} />
      </PaneRemaining>
    </PaneContainer>
  );
};
