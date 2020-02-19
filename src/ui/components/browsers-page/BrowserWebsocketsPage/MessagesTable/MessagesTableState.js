import React from 'react';
import { getUntrackedObject } from 'react-tracked';

import {
  useDispatch,
  useSelector,
  useTrackedState
} from '../../../../state/state';
import MessagesTable from './MessagesTable';

import { WEBSOCKET_MESSAGE_TABLE_COLUMNS } from '../../../../state/constants';

export default () => {
  const dispatch = useDispatch();
  const trackedState = useTrackedState();
  const untrackedState = getUntrackedObject(trackedState);

  // Tracked state vars:
  useSelector(state => state.browserWebsocketsPage.websocketMessages.length);
  const websocketMessages = useSelector(
    state => state.browserWebsocketsPage.websocketMessages
  );

  // Untracked state vars:
  const orderBy = untrackedState.browserWebsocketsPage.orderBy;
  const dir = untrackedState.browserWebsocketsPage.dir;
  const selectedMessageId = untrackedState.browserNetworkPage.selectedMessageId;
  const selectedMessageId2 =
    untrackedState.browserNetworkPage.selectedMessageId2;

  const toggleColumnOrder = key =>
    dispatch({
      type: 'TOGGLE_COLUMN_ORDER_MESSAGES',
      columnKey: key,
      page: 'browserWebsocketsPage'
    });

  const selectMessage = ({ event, rowData }) => {
    // Do not proceed if this is a right-click
    if (event.nativeEvent.which === 3) return;

    const websocketMessage = rowData;
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
