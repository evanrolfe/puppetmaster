import { ipcRenderer, remote } from 'electron';

import { all } from 'redux-saga/effects';
import { createContainer } from 'react-tracked';
// eslint-disable-next-line import/no-named-as-default
import useSagaReducer from './useSagaReducer';
import { getPane } from './selectors';

import { appSagas } from './sagas/app-sagas';
import { browserSagas } from './sagas/browser-sagas';
import { interceptSagas } from './sagas/intercept-sagas';
import { requestSagas } from './sagas/request-sagas';
import { websocketMessageSagas } from './sagas/websocket-message-sagas';

import {
  RESOURCE_TYPES,
  STATUS_CODES,
  ALL_TABLE_COLUMNS,
  DEFAULT_COLUMNS,
  DEFAULT_PAGE_LAYOUTS
} from './constants';

const requestsTableColumns = ALL_TABLE_COLUMNS.filter(column =>
  DEFAULT_COLUMNS.includes(column.key)
);

const initialState = {
  activeTheme: 'default',
  shiftPressed: false,
  windowSizeThrottel: remote.getCurrentWindow().getSize(),
  browserInterceptPage: {
    request: null,
    requestHeadersText: '',
    requestPayloadText: '',
    interceptEnabled: false,
    tabIndex: 0
  },
  browserWebsocketsPage: {
    websocketMessages: [],
    websocketMessage: null,
    selectedMessageId: null,
    selectedMessageId2: null,
    orderBy: 'id',
    dir: 'desc',
    filters: {
      search: ''
    },
    page: {
      orientation: 'horizontal',
      panes: [
        {
          id: 1,
          tab: 'Websockets',
          length: 700,
          draggingPane: false
        },
        {
          id: 2,
          draggingPane: false
        }
      ]
    }
  },
  browserNetworkPage: {
    showModifiedRequest: true,
    showModifiedResponse: true,
    requestViewTabIndex: 0,
    viewMode: 'pretty', // pretty | raw | preview | parsed
    viewContent: 'render', // source | render
    orderBy: 'id',
    dir: 'desc',
    requestsTableColumns: requestsTableColumns,
    requestsTableScrollTop: 0,
    browsers: [],
    requests: [],
    request: null,
    selectedRequestId: null,
    selectedRequestId2: null,
    filters: {
      hostList: [],
      hostSetting: '', // ''|'include'|'exclude'
      pathList: [],
      pathSetting: '', // ''|'include'|'exclude'
      statusCodes: Object.keys(STATUS_CODES),
      resourceTypes: RESOURCE_TYPES,
      extSetting: '', // ''|'include'|'exclude'
      extList: [],
      search: '',
      browserId: null
    },
    page: DEFAULT_PAGE_LAYOUTS.vert2PaneSplit,
    pageLayout: 'vert2PaneSplit'
  }
};

/* ----------------------------------------------------------------------------*
 * Reducers:
 * ----------------------------------------------------------------------------*/
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

const selectRequest = (state, action) => {
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
  return newState;
};

const selectWebsocketMessage = (state, action) => {
  let selectedMessageId2 = null;

  if (state.shiftPressed === true) {
    if (state.browserWebsocketsPage.selectedMessageId2 === null) {
      selectedMessageId2 = state.browserWebsocketsPage.selectedMessageId;
    } else {
      selectedMessageId2 = state.browserWebsocketsPage.selectedMessageId2;
    }
  }

  const newState = { ...state };
  newState[action.page].selectedMessageId = action.websocketMessageId;
  newState[action.page].selectedMessageId2 = selectedMessageId2;
  return newState;
};

const selectPrevWebsocketMessage = (state, action) => {
  const index = state[action.page].websocketMessages.findIndex(
    websocketMessage =>
      websocketMessage.id === state[action.page].selectedMessageId
  );
  const prevMessage = state[action.page].websocketMessages[index - 1];
  if (prevMessage === undefined) return state;

  return selectWebsocketMessage(state, {
    websocketMessageId: prevMessage.id,
    page: action.page
  });
};

const selectNextWebsocketMessage = (state, action) => {
  const index = state[action.page].websocketMessages.findIndex(
    websocketMessage =>
      websocketMessage.id === state[action.page].selectedMessageId
  );
  const nextMessage = state[action.page].websocketMessages[index + 1];
  if (nextMessage === undefined) return state;

  return selectWebsocketMessage(state, {
    websocketMessageId: nextMessage.id,
    page: action.page
  });
};

const toggleColumnOrder = (state, action) => {
  const newState = { ...state };

  if (action.columnKey !== state[action.page].orderBy) {
    newState[action.page].orderBy = action.columnKey;
  } else {
    newState[action.page].dir =
      state[action.page].dir === 'asc' ? 'desc' : 'asc';
  }

  return newState;
};

const setColumnWidth = (state, action) => {
  const newState = { ...state };
  const newTableColumns = [...state[action.page].requestsTableColumns];
  newTableColumns[action.columnIndex].width = action.width;

  newState[action.page].requestsTableColumns = newTableColumns;

  return newState;
};

const setSearch = (state, action) => {
  const newFilters = Object.assign({}, state[action.page].filters);
  newFilters.search = action.value;

  const newState = { ...state };
  newState[action.page].filters = newFilters;
  return newState;
};

const setFilters = (state, action) => {
  const newFilters = Object.assign({}, state[action.page].filters);

  Object.keys(action.filters).forEach(key => {
    newFilters[key] = action.filters[key];
  });

  const newState = { ...state };
  newState[action.page].filters = newFilters;
  return newState;
};

const setBodyTabView = (state, action) => {
  const newState = { ...state };
  newState[action.page].viewMode = action.viewMode;
  newState[action.page].viewContent = action.viewContent;
  return newState;
};

const setNestedValue = (key, state, action) => {
  const newState = { ...state };

  newState[action.page][key] = action[key];

  return newState;
};

const setOrientation = (state, action) => {
  const newState = { ...state };

  newState.browserNetworkPage.page.orientation = action.orientation;

  // Set default lengths for each pane:
  let defaultLength;
  if (action.orientation === 'vertical') {
    defaultLength = 500;
  } else if (action.orientation === 'horizontal') {
    defaultLength = 200;
  }
  newState.browserNetworkPage.page.panes.forEach(pane => {
    pane.length = defaultLength;
  });

  return newState;
};

const setPaneValue = (key, state, action) => {
  const newState = { ...state };

  const pane = getPane(state, action.paneId, action.page);
  pane[key] = action[key];

  return newState;
};

const setLayout = (state, action) => {
  const newState = { ...state };

  newState[action.page].pageLayout = action.pageLayout;
  newState[action.page].page = DEFAULT_PAGE_LAYOUTS[action.pageLayout];

  return newState;
};

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

const reducer = (state, action) => {
  switch (action.type) {
    case 'BROWSERS_LOADED':
      return setNestedValue('browsers', state, action);

    case 'REQUESTS_LOADED':
      ipcRenderer.send('requestsChanged', { requests: action.requests });
      return setNestedValue('requests', state, action);

    case 'REQUEST_LOADED':
      return setNestedValue('request', state, action);

    // RequestsTable:
    case 'SELECT_REQUEST':
      return selectRequest(state, action);
    case 'SELECT_PREV_REQUEST':
      return selectPrevRequest(state, action);
    case 'SELECT_NEXT_REQUEST':
      return selectNextRequest(state, action);
    case 'SHIFT_PRESSED':
      return { ...state, shiftPressed: true };
    case 'SHIFT_RELEASED':
      return { ...state, shiftPressed: false };
    case 'TOGGLE_COLUMN_ORDER':
      return toggleColumnOrder(state, action);
    case 'SET_COLUMN_WIDTH':
      return setColumnWidth(state, action);
    case 'SET_SCROLLTOP':
      return setNestedValue('requestsTableScrollTop', state, action);
    case 'SET_DRAGGING_PANE':
      return setPaneValue('draggingPane', state, action);
    case 'SET_PANE_LENGTH':
      return setPaneValue('length', state, action);
    case 'SET_PANE_TABINDEX':
      return setPaneValue('tabIndex', state, action);
    case 'SET_SHOW_MODIFIED_REQUEST':
      return setNestedValue('showModifiedRequest', state, action);
    case 'SET_SHOW_MODIFIED_RESPONSE':
      return setNestedValue('showModifiedResponse', state, action);

    case 'SET_SEARCH':
      return setSearch(state, action);
    case 'SET_FILTERS':
      return setFilters(state, action);
    case 'SET_WINDOW_SIZE_THROTTLED':
      return { ...state, windowSizeThrottel: action.windowSize };

    case 'SET_LAYOUT':
      return setLayout(state, action);

    // RequestView:
    case 'SET_BODYTAB_VIEW':
      return setBodyTabView(state, action);

    // Websockets:
    case 'WEBSOCKET_MESSAGES_LOADED':
      ipcRenderer.send('websocketMessagesTabledChanged', {
        websocketMessages: action.websocketMessages
      });
      return setNestedValue('websocketMessages', state, action);
    case 'SELECT_WEBSOCKET_MESSAGE':
      return selectWebsocketMessage(state, action);
    case 'SELECT_PREV_WEBSOCKET_MESSAGE':
      return selectPrevWebsocketMessage(state, action);
    case 'SELECT_NEXT_WEBSOCKET_MESSAGE':
      return selectNextWebsocketMessage(state, action);
    case 'WEBSOCKET_MESSAGE_LOADED':
      return setNestedValue('websocketMessage', state, action);

    // SettingsModal:
    case 'SET_THEME':
      return { ...state, activeTheme: action.theme };
    case 'SET_ORIENTATION':
      return setOrientation(state, action);
    case 'SET_TABLECOLUMNS':
      return setNestedValue('requestsTableColumns', state, action);

    case 'SET_INTERCEPT_REQUEST':
      return setInterceptRequest(state, action);
    case 'UPDATE_INTERCEPT_REQUEST':
      return setNestedValue(action.key, state, action);

    case 'SET_INTERCEPT_ENABLED':
      return setNestedValue('interceptEnabled', state, action);
    case 'SET_INTERCEPT_TABINDEX':
      return setNestedValue('tabIndex', state, action);

    default:
      return state; // needs this for AsyncAction
  }
};

/* ----------------------------------------------------------------------------*
 * Sagas:
 * ----------------------------------------------------------------------------*/
function* rootSaga() {
  let rootSagas = [];

  rootSagas = rootSagas.concat(appSagas);
  rootSagas = rootSagas.concat(browserSagas);
  rootSagas = rootSagas.concat(interceptSagas);
  rootSagas = rootSagas.concat(requestSagas);
  rootSagas = rootSagas.concat(websocketMessageSagas);

  yield all(rootSagas);
}

// eslint-disable-next-line import/no-named-as-default
const useValue = () => useSagaReducer(rootSaga, reducer, initialState);

export const {
  Provider,
  useTrackedState,
  useSelector,
  getUntrackedObject,
  useUpdate: useDispatch
} = createContainer(useValue);
