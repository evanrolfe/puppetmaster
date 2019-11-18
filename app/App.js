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
import BrowserSessionsDropdown from './components/BrowserSessionsDropdown';

import BackendConnection from './lib/BackendConnection';
import SettingsContext from './lib/SettingsContext';
import SettingsProvider from './lib/SettingsProvider';

export default class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.context = context;

    log.warn('Inside react constructor!');

    ipcRenderer.on('toggle-preferences', () => {
      showModal(SettingsModal);
    });

    const backendConn = new BackendConnection('pntest1');
    const backendConnected = backendConn.init();
    global.backendConn = backendConn;

    // Ensure that the app gets re-rendered once we connect to the backend
    // eslint-disable-next-line react/no-unused-state
    this.state = { backendConnected: backendConnected };
  }

  componentDidMount() {
    this.setTheme();
  }

  /*
  componentDidUpdate(prevProps, prevState) {
    if (this.state.settings.activeTheme !== prevState.settings.activeTheme) {
      this.setTheme();
    }
  }
*/

  setTheme() {
    document.body.setAttribute('theme', 'default');
  }

  render() {
    console.log('Rendering App');
    const history = createHashHistory();

    const content = (
      <>
        <Route exact path="/" component={BrowserNetworkPage} />
        <Route exact path="/browser/network" component={BrowserNetworkPage} />

        <Route
          exact
          path="/browser/intercept"
          component={BrowserInterceptPage}
        />
        <Route exact path="/browser/sessions" component={BrowserSessionsPage} />

        <Route exact path="/crawler" component={CrawlerPage} />
        <Route exact path="/requests" component={RequestsPage} />
        <Route exact path="/scans" component={ScansPage} />
      </>
    );

    return (
      <SettingsProvider>
        <HashRouter history={history}>
          <div key="modals" className="modals">
            <AlertModal ref={registerModal} />
            <SettingsModal ref={registerModal} />
          </div>

          <div className="app-container">
            <Route path="/" component={Sidebar} />

            <div className="theme--pane app-content">
              <div className="pane-container-vertical">
                <div className="pane-remaining">{content}</div>

                <div className="pane-fixed status-bar">
                  <BrowserSessionsDropdown />
                </div>
              </div>
            </div>
          </div>
        </HashRouter>
      </SettingsProvider>
    );
  }
}

App.contextType = SettingsContext;
