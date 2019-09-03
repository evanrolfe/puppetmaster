// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

type Props = {};

export default class BrowserIntercept extends Component<Props> {
  props: Props;

  render() {
    return (
      <div>
        Browser Intercept!
        <br />
        <Link to="/browser/sessions">Back</Link>
      </div>
    );
  }
}
