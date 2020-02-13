import React from 'react';
import { ipcRenderer } from 'electron';

import { useDispatch, useSelector } from '../../../state/state';
import MessagesTable from './MessagesTable';

import { WEBSOCKET_MESSAGE_TABLE_COLUMNS } from '../../../state/constants';

export default () => {
  const dispatch = useDispatch();

  const websocketMessages = useSelector(
    state => state.browserWebsocketsPage.websocketMessages
  );
  const selectedMessageId = useSelector(
    state => state.browserWebsocketsPage.selectedMessageId
  );
  const selectedMessageId2 = useSelector(
    state => state.browserWebsocketsPage.selectedMessageId2
  );
  const orderBy = useSelector(state => state.browserWebsocketsPage.orderBy);
  const dir = useSelector(state => state.browserWebsocketsPage.dir);

  const toggleColumnOrder = key =>
    dispatch({
      type: 'TOGGLE_COLUMN_ORDER_MESSAGES',
      columnKey: key,
      page: 'browserWebsocketsPage'
    });

  const selectMessage = (websocketMessage, event) => {
    // Do not proceed if this is a right-click
    if (event.nativeEvent.which === 3) return;

    dispatch({
      type: 'SELECT_WEBSOCKET_MESSAGE_LOAD',
      websocketMessage: websocketMessage
    });
  };

  const shiftPressed = () => dispatch({ type: 'SHIFT_PRESSED' });
  const shiftReleased = () => dispatch({ type: 'SHIFT_RELEASED' });
  const selectPrevMessage = () =>
    dispatch({ type: 'SELECT_PREV_WEBSOCKET_MESSAGE_LOAD' });
  const selectNextMessage = () =>
    dispatch({ type: 'SELECT_NEXT_WEBSOCKET_MESSAGE_LOAD' });

  // NOTE: This fires twice when the event is received for some reason
  ipcRenderer.on('deleteWebsocketMessage', (event, args) => {
    console.log(`DELETING WEBSOCKET: ${args.websocketMesageId}`);
    dispatch({
      type: 'DELETE_WEBSOCKET_MESSAGE',
      websocketMesageId: args.websocketMesageId
    });
  });

  return (
    <MessagesTable
      websocketMessages={websocketMessages}
      columns={WEBSOCKET_MESSAGE_TABLE_COLUMNS}
      toggleColumnOrder={toggleColumnOrder}
      selectedMessageId={selectedMessageId}
      selectedMessageId2={selectedMessageId2}
      orderBy={orderBy}
      dir={dir}
      selectMessage={selectMessage}
      shiftPressed={shiftPressed}
      shiftReleased={shiftReleased}
      selectPrevMessage={selectPrevMessage}
      selectNextMessage={selectNextMessage}
    />
  );
};
