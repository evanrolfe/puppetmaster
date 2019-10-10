import React, { Component } from 'react';

type Props = {
  request: 'object'
};

export default class BodyTab extends Component<Props> {
  props: Props;

  render() {
    const request = this.props.request;

    return <div className="request-tab-panel">{request.response_body}</div>;
  }
}
