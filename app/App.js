// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { createHashHistory } from 'history';
import { Route } from 'react-router';
import { HashRouter } from 'react-router-dom';
import log from 'electron-log';
import fs from 'fs';

import { registerModal, showModal } from './components/modals/index';
import AlertModal from './components/modals/AlertModal';
import SettingsModal from './components/modals/SettingsModal';
import Sidebar from './components/Sidebar';
import BrowserSessionsPage from './components/pages/BrowserSessionsPage';
import BrowserNetworkPage, {
  ALL_TABLE_COLUMNS
} from './components/pages/BrowserNetworkPage';
import BrowserInterceptPage from './components/pages/BrowserInterceptPage';
import CrawlerPage from './components/pages/CrawlerPage';
import RequestsPage from './components/pages/RequestsPage';
import ScansPage from './components/pages/ScansPage';
import BrowserSessionsDropdown from './components/BrowserSessionsDropdown';

import BackendConnection from './lib/BackendConnection';
import SettingsContext from './lib/SettingsContext';

const SETTINGS_FILE = './settings.json';

export default class App extends Component {
  constructor() {
    super();

    log.warn('Inside react constructor!');

    this.changeSetting = this.changeSetting.bind(this);

    ipcRenderer.on('toggle-preferences', () => {
      showModal(SettingsModal);
    });

    const backendConn = new BackendConnection('pntest1');
    const backendConnected = backendConn.init();
    global.backendConn = backendConn;

    // Load settings from file
    let settings;
    if (fs.existsSync(SETTINGS_FILE)) {
      const settingsJSON = fs.readFileSync(SETTINGS_FILE, 'utf8');
      settings = JSON.parse(settingsJSON);

      // Or use the default settings
    } else {
      const selectedColumns = [
        'id',
        'title',
        'method',
        'host',
        'path',
        'response_status',
        'request_type'
      ];
      const requestsTableColumns = ALL_TABLE_COLUMNS.filter(column =>
        selectedColumns.includes(column.key)
      );
      settings = {
        activeTheme: 'default',
        browserNetworkOrientation: 'vertical',
        requestsTableColumns: requestsTableColumns,
        paneWidth: 700,
        paneHeight: 350
      };
    }

    this.state = {
      settings: settings,
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

    // If the settings have changed:
    if (
      this.state.settings.activeTheme !== prevState.settings.activeTheme ||
      this.state.settings.browserNetworkOrientation !==
        prevState.settings.browserNetworkOrientation ||
      this.state.settings.requestsTableColumns !==
        prevState.settings.requestsTableColumns ||
      this.state.settings.paneWidth !== prevState.settings.paneWidth ||
      this.state.settings.paneHeight !== prevState.settings.paneHeight
    ) {
      fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(this.state.settings, null, 2)
      );
      console.log(`Saved settings to ${SETTINGS_FILE}`);
    }
  }

  setTheme() {
    document.body.setAttribute('theme', this.state.settings.activeTheme);
  }

  changeSetting(key, value) {
    this.setState(prevState => {
      const newSettings = Object.assign({}, prevState.settings);
      newSettings[key] = value;

      console.log(`Saving settings: ${key}: ${value}`);
      return { settings: newSettings };
    });
  }

  render() {
    const history = createHashHistory();

    const settingsContextValue = {
      settings: this.state.settings,
      changeSetting: this.changeSetting
    };

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
      <SettingsContext.Provider value={settingsContextValue}>
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
      </SettingsContext.Provider>
    );
  }
}

App.contextType = SettingsContext;
