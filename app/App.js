// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { createHashHistory } from 'history';
import { Route } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { registerModal, showModal } from './components/modals/index';

import AlertModal from './modals/AlertModal';
import PreferencesModal from './modals/PreferencesModal';

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

    ipcRenderer.on('toggle-preferences', () => {
      showModal(PreferencesModal);
    });
  }

  render() {
    const history = createHashHistory();

    const BrowserTitle = () => <span className="title">Browser</span>;
    const CrawlerTitle = () => <span className="title">Crawler</span>;
    const AttacksTitle = () => <span className="title">Attacks</span>;
    const ScansTitle = () => <span className="title">Scans</span>;

    return (
      <HashRouter history={history}>
        <div key="modals" className="modals">
          <AlertModal ref={registerModal} />
          <PreferencesModal ref={registerModal} />
        </div>

        <div id="content-wrapper" className="wrapper">
          <Route path="/" component={SideBar} />

          <div id="mainbar">
            <section className="theme--pane pane">
              <header className="pane__header theme--pane__header">
                <div className="header-bar">
                  <Route exact path="/" component={BrowserTitle} />
                  <Route path="/browser" component={BrowserTitle} />
                  <Route path="/crawler" component={CrawlerTitle} />
                  <Route path="/attacks" component={AttacksTitle} />
                  <Route path="/scans" component={ScansTitle} />
                </div>
              </header>

              <Route exact path="/" component={BrowserTabs} />
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
