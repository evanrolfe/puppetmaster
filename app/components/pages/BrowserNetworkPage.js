import React, { useEffect } from 'react';
import { remote } from 'electron';
import _ from 'lodash';

import { useDispatch, useSelector } from '../../state/state';
import PaneContainer from '../pane/PaneContainer';
import PaneRemaining from '../pane/PaneRemaining';
import PaneFixed from '../pane/PaneFixed';
import PaneWithTabsState from '../BrowserNetworkPage/PaneWithTabsState';
import PaneResizeable from '../pane/PaneResizeable';
import BrowserTabs from '../BrowserTabs';
import RequestsTableState from '../BrowserNetworkPage/RequestsTableState';
import RequestsFilterFormState from '../BrowserNetworkPage/RequestsFilterFormState';
import RequestTabState from '../BrowserNetworkPage/RequestTabState';
import ResponseTabState from '../BrowserNetworkPage/ResponseTabState';
import BodyTabState from '../BrowserNetworkPage/BodyTabState';

export const RESOURCE_TYPES = [
  'document',
  'eventsource',
  'fetch',
  'font',
  'image',
  'manifest',
  'media',
  'navigation',
  'other',
  'stylesheet',
  'script',
  'texttrack',
  'websocket',
  'xhr'
];

export const STATUS_CODES = {
  2: '2xx [Success]',
  3: '3xx [Redirect]',
  4: '4xx [Request Error]',
  5: '5xx [Server Error]'
};

type Props = {
  history: 'object',
  location: 'object'
};

export default ({ history, location }: Props) => {
  console.log(`[RENDER] BrowserNetworkPage`);

  const dispatch = useDispatch();

  const orientation = useSelector(
    state => state.browserNetworkPage.orientation
  );
  const inverseOrientation =
    orientation === 'vertical' ? 'horizontal' : 'vertical';

  dispatch({ type: 'LOAD_REQUESTS' });
  dispatch({ type: 'LOAD_BROWSERS' });

  global.backendConn.listen('requestCreated', () => {
    dispatch({ type: 'LOAD_REQUESTS' });
  });
  global.backendConn.listen('browsersChanged', () => {
    dispatch({ type: 'LOAD_REQUESTS' });
  });

  const _setWindowSize = () => {
    const size = remote.getCurrentWindow().getSize();
    dispatch({ type: 'SET_WINDOW_SIZE_THROTTLED', windowSize: size });
  };
  const _setWindowSizeThrottled = _.throttle(_setWindowSize, 250);

  useEffect(
    () => {
      window.addEventListener('resize', _setWindowSizeThrottled);

      return () => {
        window.removeEventListener('resize', _setWindowSizeThrottled);
      };
    },
    [_setWindowSizeThrottled]
  );

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

  return (
    <PaneContainer orientation={inverseOrientation}>
      <PaneResizeable>{requestsTablePane}</PaneResizeable>

      <PaneRemaining>
        <PaneWithTabsState tabs={['Request', 'Response', 'Body']}>
          <RequestTabState />
          <ResponseTabState />
          <BodyTabState />
        </PaneWithTabsState>
      </PaneRemaining>
    </PaneContainer>
  );
};
