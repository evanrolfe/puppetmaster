// @flow
import React from 'react';
import { createHashHistory } from 'history';
import { Route } from 'react-router';
import { HashRouter } from 'react-router-dom';

import { registerModal } from './modals/index';
import AlertModal from './modals/AlertModal';
import SettingsModal from './modals/SettingsModal';
import Sidebar from './Sidebar';
import BrowserSessionsPage from './pages/BrowserSessionsPage';
import BrowserNetworkPage from './pages/BrowserNetworkPage';
import BrowserInterceptPage from './pages/BrowserInterceptPage';
import CrawlerPage from './pages/CrawlerPage';
import RequestsPage from './pages/RequestsPage';
import ScansPage from './pages/ScansPage';

import BrowserNetworkConfig from './BrowserNetworkConfig';
import { useDispatch } from '../state/state';

export default () => {
  console.log('[RENDER] ThemedApp');
  const history = createHashHistory();
  const dispatch = useDispatch();

  dispatch({ type: 'LOAD_STATE' });

  const content = (
    <>
      <Route exact path="/" component={BrowserNetworkPage} />
      <Route exact path="/browser/network" component={BrowserNetworkPage} />

      <Route exact path="/browser/intercept" component={BrowserInterceptPage} />
      <Route exact path="/browser/sessions" component={BrowserSessionsPage} />

      <Route exact path="/crawler" component={CrawlerPage} />
      <Route exact path="/requests" component={RequestsPage} />
      <Route exact path="/scans" component={ScansPage} />
    </>
  );

  return (
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
              <Route exact path="/" component={BrowserNetworkConfig} />
              <Route
                exact
                path="/browser/network"
                component={BrowserNetworkConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </HashRouter>
  );
};
