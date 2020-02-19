import React from 'react';
import { AutoSizer, Column, Table } from 'react-virtualized';

import KeydownBinder from '../../../KeydownBinder';
import rowRenderer from './rowRenderer';

type Props = {
  websocketMessages: 'array',
  columns: 'array',
  shiftPressed: 'function',
  shiftReleased: 'function',
  selectMessage: 'function',
  selectPrevMessage: 'function',
  selectNextMessage: 'function'
};

export default ({
  websocketMessages,
  columns,
  shiftPressed,
  shiftReleased,
  selectMessage,
  selectPrevMessage,
  selectNextMessage
}: Props) => {
  console.log(
    `[RENDER] MessagesTable with ${websocketMessages.length} messages`
  );

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

  return (
    <KeydownBinder
      stopMetaPropagation
      onKeydown={_handleKeyDown}
      onKeyup={_handleKeyUp}
    >
      <div className="pane-remaining" style={{ overflowX: 'hidden' }}>
        <AutoSizer className="no-highlight">
          {({ height, width }) => (
            <Table
              className="no-highlight"
              width={width}
              height={height}
              headerHeight={21}
              rowCount={websocketMessages.length}
              rowGetter={({ index }) => websocketMessages[index]}
              onRowClick={selectMessage}
              rowHeight={21}
              rowRenderer={rowRenderer}
            >
              {columns.map(column => (
                <Column
                  width={column.width}
                  label={column.title}
                  dataKey={column.key}
                />
              ))}
            </Table>
          )}
        </AutoSizer>
      </div>
    </KeydownBinder>
  );
};
