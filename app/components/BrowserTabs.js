// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

type Props = {};

export default class BrowserTabs extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <Link to="/browser/sessions">Sessions</Link> |
        <Link to="/browser/Network">Network</Link> |
        <Link to="/browser/intercept">Intercept</Link> |
      </div>
    );
  }
}
