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
    document.body.setAttribute('theme', 'one-light');
  }

  render() {
    return (
      <div id="content-wrapper" className="wrapper">
        <div id="sidebar" className="theme--sidebar">
          <div className="sidebar-icon theme--sidebar__header" title="Browser (CTRL+1)">
            <i className="fas fa-window-restore"></i>
          </div>

          <div className="sidebar-icon active theme--sidebar__header" title="Crawler (CTRL+2)">
            <i className="fas fa-spider"></i>
          </div>

          <div className="sidebar-icon theme--sidebar__header" title="Attacks (CTRL+3)">
            <i className="fas fa-crosshairs"></i>
          </div>

          <div className="sidebar-icon theme--sidebar__header" title="Scans (CTRL+4)">
            <i className="fas fa-rss"></i>
          </div>
        </div>

        <HashRouter>
          <div id="mainbar">
            <section className="request-pane theme--pane pane">
              <header className="pane__header theme--pane__header">
                <div className="header-bar">
                  <span className="title">Browser</span>
                </div>
              </header>
            </section>

            <div id="content" className="theme--pane">
              <Route exact path="/" component={BrowserTabs} />
              <Route path="/browser" component={BrowserTabs} />

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
