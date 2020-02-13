import React from 'react';

import { useSelector, useTrackedState } from '../../../state/state';
import MessageViewPane from './MessageViewPane';

const getCodeMirrorWidth = (paneWidth, windowSizeThrottel) => {
  const windowWidth = windowSizeThrottel[0];
  const sideBarWidth = 53;

  return windowWidth - sideBarWidth - paneWidth;
};

export default () => {
  const trackedState = useTrackedState();
  const { windowSizeThrottel } = trackedState;

  const websocketMessage = useSelector(
    state => state.browserWebsocketsPage.websocketMessage
  );
  const prevPaneWidth = useSelector(
    state => state.browserWebsocketsPage.page.panes[0].length
  );

  const codeMirrorWidth = getCodeMirrorWidth(prevPaneWidth, windowSizeThrottel);

  return (
    <MessageViewPane
      websocketMessage={websocketMessage}
      codeMirrorWidth={codeMirrorWidth}
    />
  );
};
