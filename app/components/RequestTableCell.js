import React from 'react';

import StatusTag from './StatusTag';

export default ({ request, column }) => {
  switch (column.key) {
    case 'id':
      return <td>{request.id}</td>;

    case 'method':
      return (
        <td>
          <span className={`http-method-${request.method}`}>
            {request.method}
          </span>
        </td>
      );

    case 'host':
      return <td>{request.host}</td>;

    case 'response_status':
      if (request.response_status === null) {
        return <td>&nbsp;</td>;
      } else {
        return (
          <td>
            <StatusTag statusCode={request.response_status} small />
          </td>
        );
      }

    case 'created_at': {
      const time = new Date(request.created_at);
      return <td>{time.toUTCString()}</td>;
    }

    default:
      return <td>{request[column.key]}</td>;
  }
};