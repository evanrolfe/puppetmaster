import { setNestedValue } from './utils';

const setInterceptRequest = (state, action) => {
  const newState = { ...state };

  newState[action.page].request = action.request;

  // Parse the request headers to text:
  if (action.request !== null && action.request.rawResponse !== undefined) {
    newState[action.page].requestHeadersText = action.request.rawResponse;
    newState[action.page].requestPayloadText = action.request.responseBody;
  } else if (
    action.request !== null &&
    action.request.rawRequest !== undefined
  ) {
    newState[action.page].requestHeadersText = action.request.rawRequest;
  } else {
    newState[action.page].requestHeadersText = '';
  }

  return newState;
};

const updateInterceptRequest = (state, action) =>
  setNestedValue(action.key, state, action);
const setInterceptEnabled = (state, action) =>
  setNestedValue('interceptEnabled', state, action);
const setInterceptIndex = (state, action) =>
  setNestedValue('tabIndex', state, action);

const interceptReducers = {
  SET_INTERCEPT_REQUEST: setInterceptRequest,
  UPDATE_INTERCEPT_REQUEST: updateInterceptRequest,
  SET_INTERCEPT_ENABLED: setInterceptEnabled,
  SET_INTERCEPT_TABINDEX: setInterceptIndex
};

export { interceptReducers };
