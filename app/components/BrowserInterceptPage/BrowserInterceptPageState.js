import React from 'react';
import ipc from 'node-ipc';

import { useSelector, useDispatch } from '../../state/state';
import BrowserInterceptPage from '../pages/BrowserInterceptPage';

export default props => {
  console.log(`[RENDER] BrowserInterceptPageState`);

  const dispatch = useDispatch();

  const request = useSelector(state => state.browserInterceptPage.request);

  global.backendConn.listen('requestIntercepted', data => {
    if (data.request === undefined) return;

    dispatch({
      type: 'SET_INTERCEPT_REQUEST',
      page: 'browserInterceptPage',
      request: data.request
    });
  });

  const forwardRequest = () => {
    console.log(`[Frontend] connecting to IPC intercept`);
    ipc.connectTo('intercept', () => {
      ipc.of.intercept.on('connect', () => {
        console.log(`[Frontend] sending IPC intercept message...`);
        ipc.of.intercept.emit('message', {
          action: 'forward',
          requestId: request.id
        });
        ipc.disconnect('intercept');
      });
    });
  };

  return (
    <BrowserInterceptPage
      request={request}
      forwardRequest={forwardRequest}
      {...props}
    />
  );
};
