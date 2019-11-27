import React from 'react';

import { useTrackedState, useDispatch, useSelector } from '../../state/state';
import RequestView from '../RequestView';

export default () => {
  const trackedState = useTrackedState();
  const dispatch = useDispatch();
  const { windowSizeThrottel } = trackedState;

  const paneWidth = useSelector(state => state.browserNetworkPage.paneWidth);
  const request = useSelector(state => state.browserNetworkPage.request);
  const orientation = useSelector(
    state => state.browserNetworkPage.orientation
  );
  const requestViewTabIndex = useSelector(
    state => state.browserNetworkPage.requestViewTabIndex
  );

  const setRequestViewTabIndex = i =>
    dispatch({
      type: 'SET_TABINDEX',
      requestViewTabIndex: i,
      page: 'browserNetworkPage'
    });

  return (
    <RequestView
      request={request}
      requestViewTabIndex={requestViewTabIndex}
      windowSizeThrottel={windowSizeThrottel}
      orientation={orientation}
      paneWidth={paneWidth}
      setRequestViewTabIndex={setRequestViewTabIndex}
    />
  );
};
