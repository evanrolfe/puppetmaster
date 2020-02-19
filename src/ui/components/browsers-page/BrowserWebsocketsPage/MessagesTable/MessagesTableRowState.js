import React from 'react';
import { ipcRenderer } from 'electron';

import MessagesTableRow from './MessagesTableRow';
import { useSelector } from '../../../../state/state';
import {
  isWebsocketMessageSelected,
  getWebsocketMessage
} from '../../../../state/selectors';
/*
 * NOTE: This state component is a bit of a hack. We only use it in order to
 *       "inject" the isSelected state into the MessagesTableRow because
 *       react-virtualized does not let us pass any more data through to the
 *       rows apart from the websocketMessage object itsself.
 */
type Props = {
  websocketMessageId: 'number'
};

export default (props: Props) => {
  const selectedMessageId2 = useSelector(
    state => state.browserWebsocketsPage.selectedMessageId2
  );
  const isSelected = useSelector(state =>
    isWebsocketMessageSelected(state, props.websocketMessageId)
  );

  const websocketMessage = useSelector(state =>
    getWebsocketMessage(state, props.websocketMessageId)
  );

  const handleRightClick = event => {
    event.preventDefault();
    const websocketMessageId = websocketMessage.id;

    if (selectedMessageId2 !== null) {
      ipcRenderer.send('showMultipleWebsocketMessageContextMenu', {
        messageId: websocketMessageId
      });
    } else {
      ipcRenderer.send('showWebsocketMessageContextMenu', {
        messageId: websocketMessageId
      });
    }
  };

  return (
    <MessagesTableRow
      {...props}
      websocketMessage={websocketMessage}
      isSelected={isSelected}
      handleRightClick={handleRightClick}
    />
  );
};
