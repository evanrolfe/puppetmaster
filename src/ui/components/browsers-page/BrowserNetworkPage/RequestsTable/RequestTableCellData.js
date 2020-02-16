import React from 'react';
import StatusTag from '../../../StatusTag';

type Props = {
  dataKey: 'string',
  rowData: 'any'
};

export default ({ dataKey, request }: Props) => {
  const cellData = request[dataKey];

  if (cellData === null || cellData === undefined) return '';

  switch (dataKey) {
    case 'method':
      return <span className={`http-method-${cellData}`}>{cellData}</span>;
    case 'request_modified': {
      const check = <i className="fas fa-check" />;
      const modified =
        request.request_modified === 1 || request.response_modified === 1;
      const content = modified ? check : '';
      return (
        <span style={{ textAlign: 'center', width: '100%' }}>{content}</span>
      );
    }

    case 'response_status':
      return <StatusTag statusCode={cellData} small />;

    case 'created_at': {
      const time = new Date(cellData);
      return <td>{time.toUTCString()}</td>;
    }

    default:
      return String(cellData);
  }
};
