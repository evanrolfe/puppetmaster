import React from 'react';
import RequestsTableHeader from '../RequestsTableHeader';

type Props = {
  columns: 'array',
  toggleColumnOrder: 'function',
  websocketMessages: 'array',
  orderBy: 'string',
  dir: 'string'
};

export default ({
  columns,
  toggleColumnOrder,
  websocketMessages,
  orderBy,
  dir
}: Props) => {
  const classNameForTableHeader = columnName => {
    if (columnName === orderBy) return 'ordered';

    return '';
  };

  return (
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
  );
};
