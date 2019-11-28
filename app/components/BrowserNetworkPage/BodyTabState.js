import React from 'react';

import { useTrackedState, useSelector, useDispatch } from '../../state/state';
import BodyTab from '../RequestView/BodyTab';

const getCodeMirrorWidth = (orientation, paneWidth, windowSizeThrottel) => {
  let codeMirrorWidth;
  const windowWidth = windowSizeThrottel[0];
  const sideBarWidth = 53;

  if (orientation === 'horizontal') {
    codeMirrorWidth = windowWidth - sideBarWidth;
  } else if (orientation === 'vertical') {
    codeMirrorWidth = windowWidth - sideBarWidth - paneWidth;
  }

  return codeMirrorWidth;
};

export default () => {
  const trackedState = useTrackedState();
  const dispatch = useDispatch();
  const { windowSizeThrottel } = trackedState;

  const request = useSelector(state => state.browserNetworkPage.request);
  const paneWidth = useSelector(state => state.browserNetworkPage.paneWidth);
  const orientation = useSelector(
    state => state.browserNetworkPage.orientation
  );
  const viewMode = useSelector(state => state.browserNetworkPage.viewMode);
  const viewContent = useSelector(
    state => state.browserNetworkPage.viewContent
  );

  const selectDropdownItem = args => {
    dispatch({
      type: 'SET_BODYTAB_VIEW',
      viewMode: args[0],
      viewContent: args[1],
      page: 'browserNetworkPage'
    });
  };

  const codeMirrorWidth = getCodeMirrorWidth(
    orientation,
    paneWidth,
    windowSizeThrottel
  );
  console.log(`codeMirrorWidth: ${codeMirrorWidth}`);
  return (
    <BodyTab
      request={request}
      codeMirrorWidth={codeMirrorWidth}
      viewContent={viewContent}
      viewMode={viewMode}
      selectDropdownItem={selectDropdownItem}
    />
  );
};
