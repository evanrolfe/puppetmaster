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

// NOTE: This only applies when orientation is vertical
const prevPanesWidthSelector = state => {
  const panes = state.browserNetworkPage.page.panes;

  return panes
    .slice(0, panes.length - 1)
    .map(pane => pane.length)
    .reduce((a, b) => a + b, 0);
};

export default () => {
  const trackedState = useTrackedState();
  const dispatch = useDispatch();
  const { windowSizeThrottel } = trackedState;

  const request = useSelector(state => state.browserNetworkPage.request);
  const prevPanesWidth = useSelector(prevPanesWidthSelector);

  const orientation = useSelector(
    state => state.browserNetworkPage.page.orientation
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
    prevPanesWidth,
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
