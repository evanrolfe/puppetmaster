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
    document.body.setAttribute('theme', 'default');
  }

  render() {
    return (
      <div id="content-wrapper" className="wrapper">
        <div id="sidebar" className="theme--sidebar">
          <div className="sidebar-icon theme--sidebar__header">
            <i className="fas fa-camera"></i>
          </div>

          <div className="sidebar-icon theme--sidebar__header">
            <i className="material-icons md-36 md-light">view_headline</i>
          </div>

          <div className="sidebar-icon theme--sidebar__header">
            <i className="material-icons md-36 md-light">call_split</i>
          </div>

          <div className="sidebar-icon theme--sidebar__header">
            <i className="material-icons md-36 md-light">call_made</i>
          </div>
        </div>

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
