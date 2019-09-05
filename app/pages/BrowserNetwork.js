// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

type Props = {};

export default class BrowserNetwork extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className="hello">
        Browser Network!
        <br />
        <Link to="/browser/intercept">Go to Intercept</Link>
        <br />
        <Link to="/crawler">Go to Crawler</Link>
      </div>
    );
  }
}
