import * as React from 'react';
import { Tab, TabList, Tabs } from 'react-tabs';

import PaneContainer from './PaneContainer';
import PaneFixed from './PaneFixed';

type Props = {
  tabs: 'array',
  children: 'object',
  tabIndex: 'number',
  setTabIndex: 'function'
};

export default ({ tabs, children, tabIndex, setTabIndex }: Props) => {
  let tabContent;

  if (Array.isArray(children)) {
    tabContent = children[tabIndex];
  } else {
    tabContent = children;
  }

  return (
    <PaneContainer orientation="vertical">
      <PaneFixed>
        <Tabs
          className="theme--pane__body react-tabs"
          selectedIndex={tabIndex}
          onSelect={i => setTabIndex(i)}
        >
          <TabList>
            {tabs.map(tabTitle => (
              <Tab>
                <button type="button">{tabTitle}</button>
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </PaneFixed>

      {tabContent}
    </PaneContainer>
  );
};
