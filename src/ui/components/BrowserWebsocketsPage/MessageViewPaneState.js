import React from 'react';

import { useSelector } from '../../state/state';
import MessageViewPane from './MessageViewPane';

export default () => {
  const websocketMessage = useSelector(
    state => state.browserWebsocketsPage.websocketMessage
  );

  return <MessageViewPane websocketMessage={websocketMessage} />;
};
