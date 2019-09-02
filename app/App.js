// @flow
import React, { Component } from 'react';
// import { createHashHistory } from 'history';
import { Route } from 'react-router';
import { HashRouter } from 'react-router-dom';

import BrowserTabs from './components/BrowserTabs';

import BrowserSessions from './pages/BrowserSessions';
import BrowserNetwork from './pages/BrowserNetwork';
import BrowserIntercept from './pages/BrowserIntercept';

// const history = createHashHistory();

export default class App extends Component {
  constructor() {
    super();
    document.body.setAttribute('theme', 'material');
  }

  render() {
    return (
      <div id="content-wrapper" className="wrapper">
        <div id="sidebar" className="theme--sidebar">X</div>

        <HashRouter>
          <div id="mainbar">
            <div id="tabs-bar" className="theme--pane__header">
              <Route exact path="/" component={BrowserTabs} />
              <Route path="/browser" component={BrowserTabs} />
            </div>

            <div id="content" className="theme--pane">
              <Route exact path="/" component={BrowserSessions} />
              <Route
                exact
                path="/browser/sessions"
                component={BrowserSessions}
              />
              <Route exact path="/browser/network" component={BrowserNetwork} />
              <Route
                exact
                path="/browser/intercept"
                component={BrowserIntercept}
              />
            </div>
          </div>
        </HashRouter>
      </div>
    );
  }
}
