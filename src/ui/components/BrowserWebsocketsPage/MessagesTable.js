import React from 'react';
import { ipcRenderer } from 'electron';

import RequestsTableHeader from '../RequestsTableHeader';
import KeydownBinder from '../KeydownBinder';

const getSelectedMessageIds = (selectedId1, selectedId2, messages) => {
  const messageIds = messages.map(message => message.id);

  const i1 = messageIds.indexOf(selectedId1);
  const i2 = messageIds.indexOf(selectedId2);
  let selectedMessageIds;

  if (i2 > i1) {
    selectedMessageIds = messageIds.slice(i1, i2 + 1);
  } else {
    selectedMessageIds = messageIds.slice(i2, i1 + 1);
  }

  return selectedMessageIds;
};

type Props = {
  columns: 'array',
  toggleColumnOrder: 'function',
  websocketMessages: 'array',
  orderBy: 'string',
  dir: 'string',
  selectedMessageId: 'number',
  selectedMessageId2: 'number',
  selectMessage: 'function',
  shiftPressed: 'function',
  shiftReleased: 'function',
  selectPrevMessage: 'function',
  selectNextMessage: 'function'
};

export default ({
  columns,
  toggleColumnOrder,
  websocketMessages,
  orderBy,
  dir,
  selectedMessageId,
  selectedMessageId2,
  selectMessage,
  shiftPressed,
  shiftReleased,
  selectPrevMessage,
  selectNextMessage
}: Props) => {
  const selectedMessageIds = getSelectedMessageIds(
    selectedMessageId,
    selectedMessageId2,
    websocketMessages
  );

  const _getRowClassName = messageId => {
    let isSelected = false;

    if (selectedMessageId2 === null) {
      isSelected = parseInt(messageId) === selectedMessageId;
    } else {
      isSelected = selectedMessageIds.includes(messageId);
    }

    if (isSelected) {
      return 'selected';
    }
  };

  const classNameForTableHeader = columnName => {
    if (columnName === orderBy) return 'ordered';

    return '';
  };

  const _handleKeyUp = e => {
    if (e.key === 'Shift') shiftReleased();
  };

  const _handleKeyDown = e => {
    if (!['ArrowUp', 'ArrowDown', 'Shift'].includes(e.key)) return;

    e.preventDefault();

    if (e.key === 'ArrowUp') selectPrevMessage();
    if (e.key === 'ArrowDown') selectNextMessage();
    if (e.key === 'Shift') shiftPressed();
  };

  const _handleRightClick = (messageId, event) => {
    event.preventDefault();

    if (selectedMessageId2 !== null) {
      ipcRenderer.send('showMultipleWebsocketMessageContextMenu', {
        messageId: messageId
      });
    } else {
      ipcRenderer.send('showWebsocketMessageContextMenu', {
        messageId: messageId
      });
    }
  };

  // This will create the context menus for the multiple requests selection
  if (selectedMessageIds.length > 1) {
    console.log(
      `[Frontend] Create context menu for multiple websocket messages`
    );
    ipcRenderer.send('websocketMessagesSelected', {
      websocketMessageIds: selectedMessageIds
    });
  }

  return (
    <KeydownBinder
      stopMetaPropagation
      onKeydown={_handleKeyDown}
      onKeyup={_handleKeyUp}
    >
      <div className="pane-remaining" style={{ overflowX: 'auto' }}>
        <table className="requests-table">
          <thead>
            <tr>
              {columns.map((column, i) => (
                <RequestsTableHeader
                  key={`MessagesTableHeader${i}`}
                  onClick={() => toggleColumnOrder(column.key)}
                  className={classNameForTableHeader(column.key)}
                  orderDir={dir}
                  width={column.width}
                  columnIndex={i}
                >
                  {column.title}
                </RequestsTableHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {websocketMessages.map(websocketMessage => (
              <tr
                key={websocketMessage.id}
                id={`websocketMessageRow${websocketMessage.id}`}
                onMouseDown={e => selectMessage(websocketMessage, e)}
                className={_getRowClassName(websocketMessage.id)}
                onContextMenu={_handleRightClick.bind(
                  this,
                  websocketMessage.id
                )}
              >
                <td>{websocketMessage.id}</td>
                <td>{websocketMessage.url}</td>
                <td>{websocketMessage.direction}</td>
                <td>{websocketMessage.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </KeydownBinder>
  );
};
