import React from 'react';
import ipc from 'node-ipc';

import { useSelector, useDispatch } from '../../state/state';
import BrowserInterceptPage from '../pages/BrowserInterceptPage';

export default props => {
  console.log(`[RENDER] BrowserInterceptPageState`);

  const dispatch = useDispatch();

  const request = useSelector(state => state.browserInterceptPage.request);
  const interceptEnabled = useSelector(
    state => state.browserInterceptPage.interceptEnabled
  );

  global.backendConn.listen('requestIntercepted', data => {
    if (data.request === undefined) return;

    dispatch({
      type: 'SET_INTERCEPT_REQUEST',
      page: 'browserInterceptPage',
      request: data.request
    });
  });

  const interceptCommand = action => {
    if (request === null) return; // Incase disable is pressed with no request

    console.log(`[Frontend] connecting to IPC intercept`);
    ipc.connectTo('intercept', () => {
      ipc.of.intercept.on('connect', () => {
        console.log(`[Frontend] sending IPC intercept message...`);

        ipc.of.intercept.emit('message', {
          action: action,
          requestId: request.id
        });
        ipc.disconnect('intercept');

        dispatch({
          type: 'SET_INTERCEPT_REQUEST',
          page: 'browserInterceptPage',
          request: null
        });
      });
    });
  };

  const toggleIntercept = () => {
    const newValue = !interceptEnabled;

    // TODO: The backend should combine these two actions into one single interface
    // so the frontend can just send one single request to enable/disable
    if (newValue === false) {
      interceptCommand('disable');
    }

    global.backendConn.send('SettingsController', 'update', {
      key: 'interceptEnabled',
      value: newValue
    });

    dispatch({
      type: 'SET_INTERCEPT_ENABLED',
      page: 'browserInterceptPage',
      interceptEnabled: newValue
    });
  };

  return (
    <BrowserInterceptPage
      request={request}
      interceptCommand={interceptCommand}
      interceptEnabled={interceptEnabled}
      toggleIntercept={toggleIntercept}
      {...props}
    />
  );
};
