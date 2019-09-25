import React, { Component } from 'react';

type Props = {
  request: 'object'
};

export default class RequestsTab extends Component<Props> {
  props: Props;

  render() {
    const request = this.props.request;

    if (request === undefined || Object.keys(request).length === 0) return null;
    const headers = JSON.parse(request.request_headers);

    return (
      <div className="request-tab-panel">
        <span>
          {request.method} {request.url}
        </span>

        <br />
        <br />

        <ul>
          {Object.keys(headers).map(key => (
            <li key={key}>
              <b>{key}:</b> {headers[key]}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
