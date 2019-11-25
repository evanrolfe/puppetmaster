import { ipcRenderer } from 'electron';
import { put, takeLatest, takeEvery, all, select } from 'redux-saga/effects';
import { createContainer } from 'react-tracked';
// eslint-disable-next-line import/no-named-as-default
import useSagaReducer from './useSagaReducer';

export const RESOURCE_TYPES = [
  'document',
  'eventsource',
  'fetch',
  'font',
  'image',
  'manifest',
  'media',
  'navigation',
  'other',
  'stylesheet',
  'script',
  'texttrack',
  'websocket',
  'xhr'
];

export const STATUS_CODES = {
  2: '2xx [Success]',
  3: '3xx [Redirect]',
  4: '4xx [Request Error]',
  5: '5xx [Server Error]'
};

export const ALL_TABLE_COLUMNS = [
  { key: 'id', title: '#', width: 40 },
  { key: 'title', title: 'Browser', width: 100 },
  { key: 'method', title: 'Method', width: 70 },
  { key: 'host', title: 'Host', width: 100 },
  { key: 'path', title: 'Path', width: 200 },
  { key: 'request_type', title: 'Type', width: 100 },
  { key: 'ext', title: 'Ext', width: 40 },
  { key: 'response_status', title: 'Status', width: 70 },
  {
    key: 'response_body_length',
    title: 'Length',
    width: 70
  },
  {
    key: 'response_remote_address',
    title: 'IP Address',
    width: 130
  },
  { key: 'created_at', title: 'Time', width: 200 }
];

const selectedColumns = [
  'id',
  'title',
  'method',
  'host',
  'path',
  'response_status',
  'request_type'
];

const requestsTableColumns = ALL_TABLE_COLUMNS.filter(column =>
  selectedColumns.includes(column.key)
);

const initialState = {
  activeTheme: 'default',
  paneWidth: 700,
  paneHeight: 350,
  draggingPane: false,
  orientation: 'vertical',
  requests: [],
  request: null,
  requestViewTabIndex: 0,
  viewMode: 'pretty', // pretty | raw | preview | parsed
  viewContent: 'render', // source | render
  selectedRequestId: null,
  selectedRequestId2: null,
  requestsTableColumns: requestsTableColumns,
  shiftPressed: false,
  orderBy: 'id',
  dir: 'desc',
  requestsTableScrollTop: 0,
  browsers: [],
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
  }
};

/* ----------------------------------------------------------------------------*
 * Reducers:
 * ----------------------------------------------------------------------------*/
const browsersLoaded = (state, action) => ({
  ...state,
  browsers: action.browsers
});

const requestsLoaded = (state, action) => {
  ipcRenderer.send('requestsChanged', { requests: action.requests });

  return {
    ...state,
    requests: action.requests
  };
};

const handleRequestDelete = (state, action) => {
  let deletedIds;
  // If multiple requests were deleted:
  if (Array.isArray(action.requestId) === true) {
    deletedIds = action.requestId;

    // If a single request was deleted:
  } else {
    deletedIds = [action.requestId];
  }

  return {
    ...state,
    requests: state.requests.filter(req => !deletedIds.includes(req.id))
  };
};

const selectPrevRequest = state => {
  const index = state.requests.findIndex(
    request => request.id === state.selectedRequestId
  );
  const prevRequest = state.requests[index - 1];
  if (prevRequest === undefined) return state;

  return selectRequest(state, prevRequest.id);
};

const selectNextRequest = state => {
  const index = state.requests.findIndex(
    request => request.id === state.selectedRequestId
  );
  const nextRequest = state.requests[index + 1];
  if (nextRequest === undefined) return state;

  return selectRequest(state, nextRequest.id);
};

const selectRequest = (state, requestId) => {
  let selectedRequestId2 = null;

  if (state.shiftPressed === true) {
    if (state.selectedRequestId2 === null) {
      selectedRequestId2 = state.selectedRequestId;
    } else {
      selectedRequestId2 = state.selectedRequestId2;
    }
  }

  return {
    ...state,
    selectedRequestId: requestId,
    selectedRequestId2: selectedRequestId2
  };
};

const toggleColumnOrder = (state, columnKey) => {
  const newState = { ...state };

  if (columnKey !== state.orderBy) {
    newState.orderBy = columnKey;
  } else {
    newState.dir = state.dir === 'asc' ? 'desc' : 'asc';
  }

  return newState;
};

const setColumnWidth = (state, columnIndex, width) => {
  const newTableColumns = [...state.requestsTableColumns];
  newTableColumns[columnIndex].width = width;

  return { ...state, requestsTableColumns: newTableColumns };
};

const setScrollTop = (state, action) => ({
  ...state,
  requestsTableScrollTop: action.scrollTop
});

const setSearch = (state, value) => {
  const newFilters = Object.assign({}, state.filters);
  newFilters.search = value;
  return { ...state, filters: newFilters };
};

const setFilters = (state, filters) => {
  const newFilters = Object.assign({}, state.filters);

  Object.keys(filters).forEach(key => {
    newFilters[key] = filters[key];
  });

  return { ...state, filters: newFilters };
};

const setTabIndex = (state, action) => ({
  ...state,
  requestViewTabIndex: action.requestViewTabIndex
});

const setBodyTabView = (state, action) => ({
  ...state,
  viewMode: action.viewMode,
  viewContent: action.viewContent
});

const reducer = (state, action) => {
  switch (action.type) {
    case 'BROWSERS_LOADED':
      return browsersLoaded(state, action);
    case 'REQUESTS_LOADED':
      return requestsLoaded(state, action);
    case 'REQUEST_LOADED':
      return { ...state, request: action.request };
    case 'REQUEST_DELETED':
      return handleRequestDelete(state, action);

    // RequestsTable:
    case 'SELECT_REQUEST':
      return selectRequest(state, action.requestId);
    case 'SELECT_PREV_REQUEST':
      return selectPrevRequest(state);
    case 'SELECT_NEXT_REQUEST':
      return selectNextRequest(state);
    case 'SHIFT_PRESSED':
      return { ...state, shiftPressed: true };
    case 'SHIFT_RELEASED':
      return { ...state, shiftPressed: false };
    case 'TOGGLE_COLUMN_ORDER':
      return toggleColumnOrder(state, action.columnKey);
    case 'SET_COLUMN_WIDTH':
      return setColumnWidth(state, action.columnIndex, action.width);
    case 'SET_SCROLLTOP':
      return setScrollTop(state, action);

    // BrowserNetworkPage:
    case 'START_DRAGGING_PANE':
      return { ...state, draggingPane: true };
    case 'STOP_DRAGGING_PANE':
      return { ...state, draggingPane: false };
    case 'SET_PANE_HEIGHT':
      return { ...state, paneHeight: action.height };
    case 'SET_PANE_WIDTH':
      return { ...state, paneWidth: action.width };
    case 'SET_SEARCH':
      return setSearch(state, action.value);
    case 'SET_FILTERS':
      return setFilters(state, action.value);
    case 'SET_WINDOW_SIZE_THROTTLED':
      return { ...state, windowSizeThrottel: action.windowSize };

    // RequestView:
    case 'SET_TABINDEX':
      return setTabIndex(state, action);
    case 'SET_BODYTAB_VIEW':
      return setBodyTabView(state, action);

    // SettingsModal:
    case 'SET_THEME':
      return { ...state, activeTheme: action.theme };
    case 'SET_ORIENTATION':
      return { ...state, orientation: action.orientation };
    case 'SET_TABLECOLUMNS':
      return { ...state, requestsTableColumns: action.requestsTableColumns };

    default:
      return state; // needs this for AsyncAction
  }
};

/* ----------------------------------------------------------------------------*
 * Sagas:
 * ----------------------------------------------------------------------------*/

function* saveState() {
  const state = yield select();
  localStorage.setItem('activeTheme', state.activeTheme);
  console.log('Saved state.');
}

function* loadState() {
  const activeTheme = yield localStorage.getItem('activeTheme');
  const orientation = yield localStorage.getItem('orientation');
  const paneWidth = yield localStorage.getItem('paneWidth');
  const paneHeight = yield localStorage.getItem('paneHeight');

  yield put({ type: 'SET_THEME', theme: activeTheme });
  yield put({ type: 'SET_ORIENTATION', orientation: orientation });

  if (paneWidth !== null)
    yield put({ type: 'SET_PANE_WIDTH', width: parseInt(paneWidth) });

  if (paneHeight !== null)
    yield put({ type: 'SET_PANE_HEIGHT', height: parseInt(paneHeight) });
}

function* setThemeStorage(action) {
  yield put({ type: 'SET_THEME', theme: action.theme });
  localStorage.setItem('activeTheme', action.theme);
}

function* setOrientationStorage(action) {
  yield put({ type: 'SET_ORIENTATION', orientation: action.orientation });
  localStorage.setItem('orientation', action.orientation);
}

function* setTableColumnsStorage(action) {
  yield put({
    type: 'SET_TABLECOLUMNS',
    requestsTableColumns: action.requestsTableColumns
  });
  localStorage.setItem('requestsTableColumns', action.requestsTableColumns);
}

function* setPaneHeightStorage(action) {
  yield put({ type: 'SET_PANE_HEIGHT', height: action.height });
  localStorage.setItem('paneHeight', action.height);
}

function* setPaneWidthStorage(action) {
  yield put({ type: 'SET_PANE_WIDTH', width: action.width });
  localStorage.setItem('paneWidth', action.width);
}

function* loadRequests() {
  const filters = yield select(state => state.filters);
  const orderBy = yield select(state => state.orderBy);
  const dir = yield select(state => state.dir);

  const params = { ...filters, order_by: orderBy, dir: dir };

  const response = yield global.backendConn.send(
    'RequestsController',
    'index',
    params
  );

  const requests = response.result.body;

  yield put({ type: 'REQUESTS_LOADED', requests: requests });
}

function* loadRequest() {
  const requestId = yield select(state => state.selectedRequestId);

  const response = yield global.backendConn.send('RequestsController', `show`, {
    id: requestId
  });
  const request = response.result.body;
  console.log(`Loaded request ${request.id}`);

  yield put({ type: 'REQUEST_LOADED', request: request });
}

function* loadBrowsers() {
  const result = yield global.backendConn.send(
    'BrowsersController',
    'index',
    {}
  );
  const browsers = result.result.body;

  yield put({ type: 'BROWSERS_LOADED', browsers: browsers });
}

function* deleteRequest(action) {
  yield global.backendConn.send('RequestsController', 'delete', {
    id: action.requestId
  });
  yield put({ type: 'REQUEST_DELETED', requestId: action.requestId });
}

function* selectRequestLoad(action) {
  yield put({ type: 'SELECT_REQUEST', requestId: action.request.id });
  yield put({ type: 'LOAD_REQUEST' });
}

function* selectPrevRequestLoad() {
  yield put({ type: 'SELECT_PREV_REQUEST' });
  yield put({ type: 'LOAD_REQUEST' });
}

function* selectNextRequestLoad() {
  yield put({ type: 'SELECT_NEXT_REQUEST' });
  yield put({ type: 'LOAD_REQUEST' });
}

function* searchRequests(action) {
  yield put({ type: 'SET_SEARCH', value: action.value });
  yield put({ type: 'LOAD_REQUESTS' });
}

function* filterRequests(action) {
  yield put({ type: 'SET_FILTERS', value: action.filters });
  yield put({ type: 'LOAD_REQUESTS' });
}

function* toggleColumnOrderRequests(action) {
  yield put({ type: 'TOGGLE_COLUMN_ORDER', columnKey: action.columnKey });
  yield put({ type: 'LOAD_REQUESTS' });
}

function* rootSaga() {
  yield all([
    takeLatest('LOAD_BROWSERS', loadBrowsers),
    takeLatest('LOAD_REQUESTS', loadRequests),
    takeLatest('LOAD_REQUEST', loadRequest),
    takeEvery('DELETE_REQUEST', deleteRequest),
    takeLatest('SEARCH_REQUESTS', searchRequests),
    takeLatest('FILTER_REQUESTS', filterRequests),
    takeLatest('TOGGLE_COLUMN_ORDER_REQUESTS', toggleColumnOrderRequests),
    takeLatest('SELECT_REQUEST_LOAD', selectRequestLoad),
    takeLatest('SELECT_PREV_REQUEST_LOAD', selectPrevRequestLoad),
    takeLatest('SELECT_NEXT_REQUEST_LOAD', selectNextRequestLoad),
    takeLatest('SAVE_STATE', saveState),
    takeLatest('LOAD_STATE', loadState),
    // Settings:
    takeLatest('SET_THEME_STORAGE', setThemeStorage),
    takeLatest('SET_ORIENTATION_STORAGE', setOrientationStorage),
    takeLatest('SET_TABLECOLUMNS_STORAGE', setTableColumnsStorage),
    takeLatest('SET_PANE_HEIGHT_STORAGE', setPaneHeightStorage),
    takeLatest('SET_PANE_WIDTH_STORAGE', setPaneWidthStorage)
  ]);
}

// eslint-disable-next-line import/no-named-as-default
const useValue = () => useSagaReducer(rootSaga, reducer, initialState);

export const {
  Provider,
  useTrackedState,
  useUpdate: useDispatch
} = createContainer(useValue);
