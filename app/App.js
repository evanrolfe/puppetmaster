// @flow
import React, { Component } from 'react';
import { createHashHistory } from 'history';
import { Route } from 'react-router';
import { HashRouter } from 'react-router-dom';

import BrowserTabs from './components/BrowserTabs';
import SideBar from './components/SideBar';

import BrowserSessions from './pages/BrowserSessions';
import BrowserNetwork from './pages/BrowserNetwork';
import BrowserIntercept from './pages/BrowserIntercept';
import Crawler from './pages/Crawler';
import Attacks from './pages/Attacks';
import Scans from './pages/Scans';

export default class App extends Component {
  constructor() {
    super();
    document.body.setAttribute('theme', 'default');
  }

  render() {
    const history = createHashHistory();

    return (
      <HashRouter history={history}>
        <div id="content-wrapper" className="wrapper">
          <Route path="/" component={SideBar} />

          <div id="mainbar">
            <section className="theme--pane pane">
              <header className="pane__header theme--pane__header">
                <div className="header-bar">
                  <span className="title">Browser</span>
                </div>
              </header>

              <Route path="/browser" component={BrowserTabs} />

              <section className="pane__body theme--pane">
                <Route exact path="/" component={BrowserNetwork} />
                <Route
                  exact
                  path="/browser/network"
                  component={BrowserNetwork}
                />
                <Route
                  exact
                  path="/browser/intercept"
                  component={BrowserIntercept}
                />
                <Route
                  exact
                  path="/browser/sessions"
                  component={BrowserSessions}
                />

                <Route exact path="/crawler" component={Crawler} />

                <Route exact path="/attacks" component={Attacks} />

                <Route exact path="/scans" component={Scans} />
              </section>
            </section>
          </div>
        </div>
      </HashRouter>
    );
  }
}
