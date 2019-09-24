import React, { Component } from 'react';

type Props = {
  selectedRequestId: 'number'
};

export default class RequestView extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = { request: {} };
    this.loadRequest();
  }

  componentDidMount() {
    this.loadRequest();
  }

  componentDidUpdate(previousProps) {
    if (this.props.selectedRequestId !== previousProps.selectedRequestId) {
      this.loadRequest();
    }
  }

  async loadRequest() {
    if (
      this.props === undefined ||
      this.props.selectedRequestId === undefined
    ) {
      return;
    }

    const id = this.props.selectedRequestId;
    const response = await global.backendConn.send(
      'GET',
      `/requests/${id}`,
      {}
    );

    const request = response.result.body;
    console.log(request);

    if (request.id !== this.state.request.id) {
      const newState = Object.assign({}, this.state);
      newState.request = request;
      this.setState(newState);
    }
  }

  render() {
    const request = this.state.request;

    return (
      <>
        <h2>
          {request.method} {request.url}
        </h2>
        Status: {request.response_status} {request.response_status_message}
      </>
    );
  }
}
