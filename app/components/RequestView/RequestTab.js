import React, { Component } from 'react';
import PaneRemaining from '../pane/PaneRemaining';

type Props = {
  request: 'object'
};

export default class RequestsTab extends Component<Props> {
  props: Props;

  render() {
    const request = this.props.request;

    if (
      request === undefined ||
      request === null ||
      request.method === null ||
      Object.keys(request).length === 0
    )
      return null;

    const headers = JSON.parse(request.request_headers);

    return (
      <PaneRemaining>
        <div className="request-tab-panel">
          <span className="selectable force-wrap">
            {request.method} {request.url}
          </span>
          <br />
          <br />
          <span>Headers:</span>
          <br />
          <table
            key="table"
            className="table--fancy table--striped table--compact"
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(headers).map((key, i) => (
                <tr className="selectable" key={i}>
                  <td style={{ whiteSpace: 'nowrap' }} className="force-wrap">
                    {key}
                  </td>
                  <td className="force-wrap">{headers[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PaneRemaining>
    );
  }
}
