import React from 'react';

import { useDispatch, useSelector } from '../../state/state';
import MessagesTable from './MessagesTable';

import { WEBSOCKET_MESSAGE_TABLE_COLUMNS } from '../../state/constants';

export default () => {
  const dispatch = useDispatch();
  const websocketMessages = useSelector(
    state => state.browserWebsocketsPage.websocketMessages
  );
  const orderBy = useSelector(state => state.browserWebsocketsPage.orderBy);
  const dir = useSelector(state => state.browserWebsocketsPage.dir);

  const toggleColumnOrder = key =>
    dispatch({
      type: 'TOGGLE_COLUMN_ORDER_MESSAGES',
      columnKey: key,
      page: 'browserWebsocketsPage'
    });

  return (
    <MessagesTable
      websocketMessages={websocketMessages}
      columns={WEBSOCKET_MESSAGE_TABLE_COLUMNS}
      toggleColumnOrder={toggleColumnOrder}
      orderBy={orderBy}
      dir={dir}
    />
  );
};
