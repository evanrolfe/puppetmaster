import React, { Component } from 'react';

type Props = {
  request: 'object'
};

export default class BodyTab extends Component<Props> {
  props: Props;

  render() {
    const request = this.props.request;

    return (
      <div className="request-tab-panel">
        <div className="scrollable">{request.response_body}</div>
      </div>
    );
  }
}
