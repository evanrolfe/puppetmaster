import React from 'react';
import { getUntrackedObject } from 'react-tracked';

import { useSelector, useDispatch, useTrackedState } from '../../state/state';
import BrowserInterceptPage from '../pages/BrowserInterceptPage';

const getCodeMirrorWidth = windowSizeThrottel => {
  const windowWidth = windowSizeThrottel[0];
  const sideBarWidth = 53;

  return windowWidth - sideBarWidth;
};

export default props => {
  console.log(`[RENDER] BrowserInterceptPageState`);

  const dispatch = useDispatch();

  const tabIndex = useSelector(state => state.browserInterceptPage.tabIndex);

  const trackedState = useTrackedState();
  const untrackedState = getUntrackedObject(trackedState);
  const { windowSizeThrottel } = trackedState;
  const codeMirrorWidth = getCodeMirrorWidth(windowSizeThrottel);

  const setTabIndex = i => {
    console.log(`Setting tab index: ${i}`);
    dispatch({
      type: 'SET_INTERCEPT_TABINDEX',
      tabIndex: i,
      page: 'browserInterceptPage'
    });
  };

  const request = useSelector(state => state.browserInterceptPage.request);

  const requestHeadersText =
    untrackedState.browserInterceptPage.requestHeadersText;
  const requestPayloadText =
    untrackedState.browserInterceptPage.requestPayloadText;

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

  const interceptCommand = () => {
    if (request === null) return; // Incase disable is pressed with no request

    dispatch({ type: 'FORWARD_INTERCEPT_REQUEST' });
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

  const handleChange = codeMirror => {
    const value = codeMirror.getValue();

    if (tabIndex === 0) {
      dispatch({
        type: 'UPDATE_INTERCEPT_REQUEST',
        page: 'browserInterceptPage',
        key: 'requestHeadersText',
        requestHeadersText: value
      });
    } else if (tabIndex === 1) {
      dispatch({
        type: 'UPDATE_INTERCEPT_REQUEST',
        page: 'browserInterceptPage',
        key: 'requestPayloadText',
        requestPayloadText: value
      });
    }
  };

  return (
    <BrowserInterceptPage
      request={request}
      interceptCommand={interceptCommand}
      interceptEnabled={interceptEnabled}
      toggleIntercept={toggleIntercept}
      tabIndex={tabIndex}
      setTabIndex={setTabIndex}
      codeMirrorWidth={codeMirrorWidth}
      handleChange={handleChange}
      requestHeadersText={requestHeadersText}
      requestPayloadText={requestPayloadText}
      {...props}
    />
  );
};
