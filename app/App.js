// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { createHashHistory } from 'history';
import { Route } from 'react-router';
import { HashRouter } from 'react-router-dom';
import log from 'electron-log';

import { registerModal, showModal } from './components/modals/index';
import AlertModal from './components/modals/AlertModal';
import SettingsModal from './components/modals/SettingsModal';
import Sidebar from './components/Sidebar';
import BrowserSessionsPage from './components/pages/BrowserSessionsPage';
import BrowserNetworkPage from './components/pages/BrowserNetworkPage';
import BrowserInterceptPage from './components/pages/BrowserInterceptPage';
import CrawlerPage from './components/pages/CrawlerPage';
import RequestsPage from './components/pages/RequestsPage';
import ScansPage from './components/pages/ScansPage';
import BackendConnection from './lib/BackendConnection';

export default class App extends Component {
  constructor() {
    super();

    log.warn('Inside react constructor!');

    this.handleChangeTheme = this.handleChangeTheme.bind(this);

    ipcRenderer.on('toggle-preferences', () => {
      showModal(SettingsModal);
    });

    const backendConn = new BackendConnection('pntest1');
    const backendConnected = backendConn.init();
    // TODO: Refactor this so we don't have to use global vars - maybe use a singleton instead?
    global.backendConn = backendConn;

    this.state = {
      settings: {
        activeTheme: 'default'
      },
      // Ensure that the app gets re-rendered once we connect to the backend
      // eslint-disable-next-line react/no-unused-state
      backendConnected: backendConnected
    };
  }

  componentDidMount() {
    this.setTheme();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.settings.activeTheme !== prevState.settings.activeTheme) {
      this.setTheme();
    }
  }

  setTheme() {
    document.body.setAttribute('theme', this.state.settings.activeTheme);
  }

  handleChangeTheme(theme) {
    // TODO: Deep clone the state object
    this.setState(prevState => {
      const newsettings = Object.assign({}, prevState.settings);
      newsettings.activeTheme = theme;
      return { settings: newsettings };
    });
  }

  render() {
    const history = createHashHistory();

    return (
      <HashRouter history={history}>
        <div key="modals" className="modals">
          <AlertModal ref={registerModal} />
          <SettingsModal
            ref={registerModal}
            activeTheme={this.state.settings.activeTheme}
            handleChangeTheme={this.handleChangeTheme}
          />
        </div>

        <div className="app-container">
          <Route path="/" component={Sidebar} />

          <div className="theme--pane app-content">
            <Route exact path="/" component={BrowserNetworkPage} />
            <Route
              exact
              path="/browser/network"
              component={BrowserNetworkPage}
            />

            <Route
              exact
              path="/browser/intercept"
              component={BrowserInterceptPage}
            />
            <Route
              exact
              path="/browser/sessions"
              component={BrowserSessionsPage}
            />

            <Route exact path="/crawler" component={CrawlerPage} />
            <Route exact path="/requests" component={RequestsPage} />
            <Route exact path="/scans" component={ScansPage} />
          </div>
        </div>
      </HashRouter>
    );
  }
}
