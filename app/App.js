// @flow
import { ipcRenderer, remote } from 'electron';
import React, { Component } from 'react';
import { createHashHistory } from 'history';
import { Route } from 'react-router';
import { HashRouter } from 'react-router-dom';
import log from 'electron-log';
import _ from 'lodash';

import { registerModal, showModal } from './components/modals/index';
import AlertModal from './components/modals/AlertModal';
import SettingsModal from './components/modals/SettingsModal';
import BrowserTabs from './components/BrowserTabs';
import SideBar from './components/SideBar';
import BrowserSessions from './pages/BrowserSessions';
import BrowserNetwork from './pages/BrowserNetwork';
import BrowserIntercept from './pages/BrowserIntercept';
import Crawler from './pages/Crawler';
import Requests from './pages/Requests';
import Scans from './pages/Scans';
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
        activeTheme: 'default',
        browserNetworkPaneHeight: 250,
        windowSize: remote.getCurrentWindow().getSize()
      },
      // Ensure that the app gets re-rendered once we connect to the backend
      // eslint-disable-next-line react/no-unused-state
      backendConnected: backendConnected
    };

    this.setBrowserNetworkPaneHeight = this.setBrowserNetworkPaneHeight.bind(
      this
    );
    this.throttledSetWindowSizeState = _.throttle(
      this.setWindowSizeState.bind(this),
      100
    );
  }

  componentDidMount() {
    this.setTheme();

    window.addEventListener('resize', this.throttledSetWindowSizeState);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.settings.activeTheme !== prevState.settings.activeTheme) {
      this.setTheme();
    }
  }

  setWindowSizeState() {
    this.setState(prevState => {
      const newsettings = Object.assign({}, prevState.settings);
      newsettings.windowSize = remote.getCurrentWindow().getSize();
      return { settings: newsettings };
    });
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

  setBrowserNetworkPaneHeight(height) {
    this.setState(prevState => {
      const newsettings = Object.assign({}, prevState.settings);
      newsettings.browserNetworkPaneHeight = height;
      return { settings: newsettings };
    });
  }

  render() {
    const history = createHashHistory();

    const BrowserTitle = () => <span className="title">Browser</span>;
    const CrawlerTitle = () => <span className="title">Crawler</span>;
    const RequestsTitle = () => <span className="title">Requests</span>;
    const ScansTitle = () => <span className="title">Scans</span>;

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

        <div id="content-wrapper" className="wrapper">
          <Route path="/" component={SideBar} />

          <div id="mainbar">
            <section className="theme--pane pane">
              <header className="pane__header theme--pane__header">
                <div className="header-bar">
                  <Route exact path="/" component={BrowserTitle} />
                  <Route path="/browser" component={BrowserTitle} />
                  <Route path="/crawler" component={CrawlerTitle} />
                  <Route path="/Requests" component={RequestsTitle} />
                  <Route path="/scans" component={ScansTitle} />
                </div>
              </header>

              <Route exact path="/" component={BrowserTabs} />
              <Route path="/browser" component={BrowserTabs} />

              <section className="pane__body theme--pane">
                <Route
                  exact
                  path="/"
                  render={() => (
                    <BrowserNetwork
                      setBrowserNetworkPaneHeight={
                        this.setBrowserNetworkPaneHeight
                      }
                      browserNetworkPaneHeight={
                        this.state.settings.browserNetworkPaneHeight
                      }
                      windowSize={this.state.settings.windowSize}
                    />
                  )}
                />
                <Route
                  exact
                  path="/browser/network"
                  render={() => (
                    <BrowserNetwork
                      setBrowserNetworkPaneHeight={
                        this.setBrowserNetworkPaneHeight
                      }
                      browserNetworkPaneHeight={
                        this.state.settings.browserNetworkPaneHeight
                      }
                      windowSize={this.state.settings.windowSize}
                    />
                  )}
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

                <Route exact path="/requests" component={Requests} />

                <Route exact path="/scans" component={Scans} />
              </section>
            </section>
          </div>
        </div>
      </HashRouter>
    );
  }
}
