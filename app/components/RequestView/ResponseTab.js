import React, { Component } from 'react';

type Props = {
  request: 'object'
};

export default class ResponseTab extends Component<Props> {
  props: Props;

  render() {
    const request = this.props.request;

    if (request === undefined || Object.keys(request).length === 0) return null;
    const headers = JSON.parse(request.response_headers);

    return (
      <div className="request-tab-panel">
        <span>
          Status: {request.response_status} {request.response_status_message}
        </span>

        <br />
        <br />

        <ul>
          {Object.keys(headers).map(key => (
            <li>
              <b>{key}:</b> {headers[key]}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
