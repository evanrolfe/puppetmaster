// @flow
import * as React from 'react';
import classnames from 'classnames';

type Props = {
  statusCode: number,

  // Optional
  small?: boolean,
  statusMessage?: string
};

class StatusTag extends React.PureComponent<Props> {
  render() {
    const { statusMessage, statusCode, small } = this.props;

    let colorClass;
    let statusCodeToDisplay = statusCode;

    const firstChar = statusCode.toString()[0] || '';
    switch (firstChar) {
      case '1':
        colorClass = 'bg-info';
        break;
      case '2':
        colorClass = 'bg-success';
        break;
      case '3':
        colorClass = 'bg-surprise';
        break;
      case '4':
        colorClass = 'bg-warning';
        break;
      case '5':
        colorClass = 'bg-danger';
        break;
      case '0':
        colorClass = 'bg-danger';
        statusCodeToDisplay = '';
        break;
      default:
        colorClass = 'bg-surprise';
        statusCodeToDisplay = '';
        break;
    }

    return (
      <div className={classnames('tag', colorClass, { 'tag--small': small })}>
        <strong>{statusCodeToDisplay}</strong> {statusMessage}
      </div>
    );
  }
}

export default StatusTag;
