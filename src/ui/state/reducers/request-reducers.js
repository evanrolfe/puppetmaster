import { ipcRenderer } from 'electron';

import { getSelectedRequestIds } from '../selectors';
import { setNestedValue } from './utils';

const requestsLoaded = (state, action) => {
  ipcRenderer.send('requestsChanged', { requests: action.requests });
  return setNestedValue('requests', state, action);
};

const requestLoaded = (state, action) =>
  setNestedValue('request', state, action);

const selectRequest = (state, action) => {
  console.log(`[REQUESTREDUCERS] selecting request ${action.requestId}...`);
  let selectedRequestId2 = null;

  if (state.shiftPressed === true) {
    if (state.browserNetworkPage.selectedRequestId2 === null) {
      selectedRequestId2 = state.browserNetworkPage.selectedRequestId;
    } else {
      selectedRequestId2 = state.browserNetworkPage.selectedRequestId2;
    }
  }

  const newState = { ...state };
  newState[action.page].selectedRequestId = action.requestId;
  newState[action.page].selectedRequestId2 = selectedRequestId2;

  // Create the multiple requests context menu if necessary:
  if (selectedRequestId2 !== null) {
    const selectedRequestIds = getSelectedRequestIds(newState);
    console.log(
      `[STATE] Create contenxt menu for(${selectedRequestIds.length}) requests`
    );
    ipcRenderer.send('requestsSelected', { requestIds: selectedRequestIds });
  }

  console.log(`[REQUESTREDUCERS] selected request ${action.requestId}`);
  return newState;
};

const selectPrevRequest = (state, action) => {
  const index = state[action.page].requests.findIndex(
    request => request.id === state[action.page].selectedRequestId
  );
  const prevRequest = state[action.page].requests[index - 1];
  if (prevRequest === undefined) return state;

  return selectRequest(state, { requestId: prevRequest.id, page: action.page });
};

const selectNextRequest = (state, action) => {
  const index = state[action.page].requests.findIndex(
    request => request.id === state[action.page].selectedRequestId
  );
  const nextRequest = state[action.page].requests[index + 1];
  if (nextRequest === undefined) return state;

  return selectRequest(state, { requestId: nextRequest.id, page: action.page });
};

const requestReducers = {
  REQUESTS_LOADED: requestsLoaded,
  REQUEST_LOADED: requestLoaded,
  SELECT_REQUEST: selectRequest,
  SELECT_PREV_REQUEST: selectPrevRequest,
  SELECT_NEXT_REQUEST: selectNextRequest
};

export { requestReducers };
