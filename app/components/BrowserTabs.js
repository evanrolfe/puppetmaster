// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

type Props = {};

export default class BrowserTabs extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        <Link to="/browser/sessions" className="theme--link">Sessions</Link> |
        <Link to="/browser/Network" className="theme--link">Network</Link> |
        <Link to="/browser/intercept" className="theme--link">Intercept</Link> |
      </div>
    );
  }
}
