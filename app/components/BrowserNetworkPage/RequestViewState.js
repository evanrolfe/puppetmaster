import React from 'react';

import { useTrackedState, useDispatch } from '../../state/state';
import RequestView from '../RequestView';

export default () => {
  const state = useTrackedState();
  const dispatch = useDispatch();
  const {
    request,
    requestViewTabIndex,
    windowSizeThrottel,
    orientation,
    paneWidth
  } = state;

  const setRequestViewTabIndex = i =>
    dispatch({ type: 'SET_TABINDEX', requestViewTabIndex: i });

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
