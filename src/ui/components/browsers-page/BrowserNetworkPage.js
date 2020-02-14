import React from 'react';

import { useSelector } from '../../state/state';
import PaneContainer from '../pane/PaneContainer';
import PaneRemaining from '../pane/PaneRemaining';
import PaneFixed from '../pane/PaneFixed';
import PaneWithTabsState from '../pane/PaneWithTabsState';
import PaneResizeableState from '../pane/PaneResizeableState';
import BrowserTabs from './BrowserNetworkPage/BrowserTabs';
import RequestsTableState from './BrowserNetworkPage/RequestsTable/RequestsTableState';
import RequestsFilterFormState from './BrowserNetworkPage/RequestsFilterFormState';
import RequestTabState from './BrowserNetworkPage/RequestTabState';
import ResponseTabState from './BrowserNetworkPage/ResponseTabState';
import BodyTabState from './BrowserNetworkPage/BodyTabState';

type Props = {
  history: 'object',
  location: 'object'
};

export default ({ history, location }: Props) => {
  console.log(`[RENDER] BrowserNetworkPage`);

  const page = useSelector(state => state.browserNetworkPage.page);

  const requestsTablePane = (
    <PaneContainer orientation="vertical">
      <PaneFixed>
        <BrowserTabs history={history} location={location} />
      </PaneFixed>

      <PaneFixed style={{ marginLeft: '10px', padding: '6px' }}>
        <RequestsFilterFormState />
      </PaneFixed>

      <RequestsTableState />
    </PaneContainer>
  );

  const renderPaneContent = tabTitle => {
    switch (tabTitle) {
      case 'Network':
        return requestsTablePane;
      case 'Request':
        return <RequestTabState />;
      case 'Response':
        return <ResponseTabState />;
      case 'Body':
        return <BodyTabState />;
      default:
        return null;
    }
  };

  // This is a pane which has no sub-panes and is also not the first pane
  const renderNormalPane = (parentPane, pane, i) => {
    const paneContent = (
      <PaneWithTabsState
        paneId={pane.id}
        pageName="browserNetworkPage"
        tabs={pane.tabs}
      >
        {pane.tabs.map(tab => renderPaneContent(tab))}
      </PaneWithTabsState>
    );

    const PaneComponent =
      i < parentPane.panes.length - 1 ? PaneResizeableState : PaneRemaining;

    return (
      <PaneComponent paneId={pane.id} pageName="browserNetworkPage">
        {paneContent}
      </PaneComponent>
    );
  };

  const renderPane = (parentPane, pane, i) => {
    // The first pane always renders BrowserTabs:
    if (pane.id === 1) {
      console.log(`Rendering first pane ${pane.id}`);
      return (
        <PaneResizeableState paneId={pane.id} pageName="browserNetworkPage">
          {renderPaneContent(pane.tab)}
        </PaneResizeableState>
      );

      // If the pane contains sub-panes:
    } else if (pane.panes !== undefined && pane.panes.length > 0) {
      console.log(`Rendering pane with sub-panes ${pane.id}`);

      const PaneComponent =
        i < parentPane.panes.length - 1 ? PaneResizeableState : PaneRemaining;

      return (
        <PaneComponent paneId={pane.id}>
          <PaneContainer orientation={pane.orientation}>
            {pane.panes.map((subPane, j) => renderNormalPane(pane, subPane, j))}
          </PaneContainer>
        </PaneComponent>
      );

      // Otherwise this is a normal pane with tabs and content:
    } else {
      console.log(`Rendering normal pane ${pane.id}`);
      return renderNormalPane(parentPane, pane, i);
    }
  };

  return (
    <PaneContainer orientation={page.orientation}>
      {page.panes.map((pane, i) => renderPane(page, pane, i))}
    </PaneContainer>
  );
};
