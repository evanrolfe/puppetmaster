import React, { Component } from 'react';

type Props = {
  request: 'object'
};

export default class BodyTab extends Component<Props> {
  props: Props;

  render() {
    const request = this.props.request;

    return (
      <>
        <h2>
          {request.method} {request.url}
        </h2>
        Body TAB
      </>
    );
  }
}
