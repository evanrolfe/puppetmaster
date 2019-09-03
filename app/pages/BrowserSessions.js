// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

type Props = {};

export default class BrowserSessions extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className="hello">
        Browser Sessions!
        <br />
        <Link to="/browser/intercept">Go to Intercept</Link>
      </div>
    );
  }
}
