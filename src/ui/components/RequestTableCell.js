import React from 'react';

import StatusTag from './StatusTag';

type Props = {
  request: 'object',
  column: 'object'
};

export default ({ request, column }: Props) => {
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

    case 'request_modified': {
      const check = <i className="fas fa-check" />;
      const modified =
        request.request_modified === 1 || request.response_modified === 1;
      const content = modified ? check : '';
      return <td style={{ textAlign: 'center' }}>{content}</td>;
    }

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
