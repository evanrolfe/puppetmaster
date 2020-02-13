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
import BrowserWebsocketsPage from './BrowserWebsocketsPage';
import BrowserNetworkPage from './BrowserNetworkPage';
import BrowserInterceptPageState from './BrowserInterceptPageState';
import RequestsPage from './RequestsPage';

import BrowserNetworkConfig from './status-bar/BrowserNetworkConfig';
import { useDispatch } from '../state/state';

export default () => {
  console.log('[RENDER] ThemedApp');
  const history = createHashHistory();
  const dispatch = useDispatch();

  dispatch({ type: 'LOAD_STATE' });
  dispatch({ type: 'LOAD_REQUESTS' });
  dispatch({ type: 'LOAD_BROWSERS' });
  dispatch({ type: 'LOAD_SETTINGS' });
  dispatch({ type: 'LOAD_WEBSOCKET_MESSAGES' });

  // Listen for new requests
  const dispatchLoadRequests = () => dispatch({ type: 'LOAD_REQUESTS' });
  global.backendConn.listen('requestCreated', dispatchLoadRequests);
  global.proxyConn.listen('requestCreated', dispatchLoadRequests);

  // Listen for new websocket messages
  const loadMessages = () => dispatch({ type: 'LOAD_WEBSOCKET_MESSAGES' });

  global.proxyConn.listen('websocketMessageCreated', loadMessages);
  global.backendConn.listen('websocketMessageCreated', loadMessages);

  // Listen for a change in browsers
  global.backendConn.listen('browsersChanged', dispatchLoadRequests);

  // Listen for a request intercepted
  global.proxyConn.listen('requestIntercepted', data => {
    if (data.request === undefined) return;

    dispatch({
      type: 'SET_INTERCEPT_REQUEST',
      page: 'browserInterceptPage',
      request: data.request
    });

    history.push('/browser/intercept');
  });

  const _setWindowSize = () => {
    const size = remote.getCurrentWindow().getSize();
    dispatch({ type: 'SET_WINDOW_SIZE_THROTTLED', windowSize: size });
  };
  const _setWindowSizeThrottled = _.throttle(_setWindowSize, 250);

  useEffect(() => {
    window.addEventListener('resize', _setWindowSizeThrottled);

    return () => {
      window.removeEventListener('resize', _setWindowSizeThrottled);
    };
  }, [_setWindowSizeThrottled]);

  const content = (
    <>
      <Route exact path="/" component={BrowserNetworkPage} />
      <Route exact path="/browser/network" component={BrowserNetworkPage} />

      <Route
        exact
        path="/browser/intercept"
        component={BrowserInterceptPageState}
      />
      <Route
        exact
        path="/browser/websockets"
        component={BrowserWebsocketsPage}
      />

      <Route exact path="/requests" component={RequestsPage} />
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
