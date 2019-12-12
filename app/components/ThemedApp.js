// @flow
import React, { useEffect } from 'react';
import { createHashHistory } from 'history';
import { Route } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { remote } from 'electron';
import _ from 'lodash';

import { registerModal } from './modals/index';
import AlertModal from './modals/AlertModal';
import SettingsModal from './modals/SettingsModal';
import Sidebar from './Sidebar';
import BrowserSessionsPage from './pages/BrowserSessionsPage';
import BrowserNetworkPage from './pages/BrowserNetworkPage';
import BrowserInterceptPageState from './BrowserInterceptPage/BrowserInterceptPageState';
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
  dispatch({ type: 'LOAD_REQUESTS' });
  dispatch({ type: 'LOAD_BROWSERS' });
  dispatch({ type: 'LOAD_SETTINGS' });

  global.backendConn.listen('requestCreated', () => {
    dispatch({ type: 'LOAD_REQUESTS' });
  });
  global.backendConn.listen('browsersChanged', () => {
    dispatch({ type: 'LOAD_REQUESTS' });
  });

  const _setWindowSize = () => {
    const size = remote.getCurrentWindow().getSize();
    dispatch({ type: 'SET_WINDOW_SIZE_THROTTLED', windowSize: size });
  };
  const _setWindowSizeThrottled = _.throttle(_setWindowSize, 250);

  useEffect(
    () => {
      window.addEventListener('resize', _setWindowSizeThrottled);

      return () => {
        window.removeEventListener('resize', _setWindowSizeThrottled);
      };
    },
    [_setWindowSizeThrottled]
  );
  /*
  // FOR TESTING PURPOSES:
  dispatch({
    type: 'SET_INTERCEPT_REQUEST',
    page: 'browserInterceptPage',
    request: {
      browser_id: 1,
      created_at: 1576059737887,
      ext: "json",
      host: "localhost",
      id: 11,
      method: "POST",
      path: "/api/users/sign_in.json",
      request_headers: `{"referer":"http://localhost/login","origin":"http://localhost","user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.0 Safari/537.36","content-type":"application/json","cookie":""}`,
      request_payload: `{"user":{"email":"alice@authcov.io","password":"password"}}`,
      request_type: "fetch",
      url: "http://localhost/api/users/sign_in.json"
    }
  });
*/

  const content = (
    <>
      <Route exact path="/" component={BrowserNetworkPage} />
      <Route exact path="/browser/network" component={BrowserNetworkPage} />

      <Route
        exact
        path="/browser/intercept"
        component={BrowserInterceptPageState}
      />
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
              <Route path="/browser" component={BrowserNetworkConfig} />
            </div>
          </div>
        </div>
      </div>
    </HashRouter>
  );
};
