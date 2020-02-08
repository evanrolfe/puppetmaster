import React from 'react';

import { useSelector } from '../../state/state';
import MessagesTable from '../MessagesTable';

export default () => {
  const websocketMessages = useSelector(
    state => state.browserWebsocketsPage.websocketMessages
  );

  return <MessagesTable websocketMessages={websocketMessages} />;
};
