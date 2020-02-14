import { remote } from 'electron';

import { all } from 'redux-saga/effects';
import { createContainer } from 'react-tracked';
// eslint-disable-next-line import/no-named-as-default
import useSagaReducer from './useSagaReducer';

// Reducers:
import { appReducers } from './reducers/app-reducers';
import { browserReducers } from './reducers/browser-reducers';
import { browserNetworkPageReducers } from './reducers/browser-network-page-reducers';
import { interceptReducers } from './reducers/intercept-reducers';
import { requestReducers } from './reducers/request-reducers';
import { websocketMessageReducers } from './reducers/websocket-message-reducers';

// Sagas:
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

/* ----------------------------------------------------------------------------*
 * Initial State:
 * ----------------------------------------------------------------------------*/
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
const reducer = (state, action) => {
  const reducers = Object.assign(
    {},
    appReducers,
    browserReducers,
    browserNetworkPageReducers,
    requestReducers,
    interceptReducers,
    websocketMessageReducers
  );
  let reducerFound;

  Object.keys(reducers).forEach(reducerType => {
    const reducer1 = reducers[reducerType];

    if (action.type === reducerType) reducerFound = reducer1;
  });

  if (reducerFound) {
    return reducerFound(state, action);
  } else {
    return state;
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
