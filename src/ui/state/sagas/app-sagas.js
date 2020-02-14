import { put, takeLatest, select } from 'redux-saga/effects';

function* saveState() {
  const state = yield select();
  localStorage.setItem('activeTheme', state.activeTheme);
  console.log('Saved state.');
}

function* loadState() {
  /*
  const orientation = yield localStorage.getItem('browserNetworkPage.orientation');
  yield put({ type: 'SET_ORIENTATION', orientation: orientation, page: 'browserNetworkPage' });

  const activeTheme = yield localStorage.getItem('activeTheme');
  yield put({ type: 'SET_THEME', theme: activeTheme });

  const paneWidth = yield localStorage.getItem('browserNetworkPage.paneWidth');
  const paneHeight = yield localStorage.getItem('browserNetworkPage.paneHeight');
  if (paneWidth !== null && paneWidth !== undefined)
    yield put({ type: 'SET_PANE_WIDTH', paneWidth: parseInt(paneWidth), page: 'browserNetworkPage' });

  if (paneHeight !== null && paneHeight !== undefined)
    yield put({ type: 'SET_PANE_HEIGHT', paneHeight: parseInt(paneHeight), page: 'browserNetworkPage' });
*/
}

function* setThemeStorage(action) {
  yield put({ type: 'SET_THEME', theme: action.theme });
  localStorage.setItem('activeTheme', action.theme);
}

function* setOrientationStorage(action) {
  yield put({
    type: 'SET_ORIENTATION',
    orientation: action.orientation,
    page: action.page
  });
  localStorage.setItem(`${action.page}.orientation`, action.orientation);
}

function* setTableColumnsStorage(action) {
  yield put({
    type: 'SET_TABLECOLUMNS',
    requestsTableColumns: action.requestsTableColumns,
    page: action.page
  });
  localStorage.setItem(
    `${action.page}.requestsTableColumns`,
    action.requestsTableColumns
  );
}

function* setPaneHeightStorage(action) {
  yield put({
    type: 'SET_PANE_HEIGHT',
    paneHeight: action.height,
    page: 'browserNetworkPage'
  });
  localStorage.setItem('browserNetworkPage.paneHeight', action.height);
}

function* setPaneWidthStorage(action) {
  yield put({
    type: 'SET_PANE_WIDTH',
    paneWidth: action.width,
    page: 'browserNetworkPage'
  });
  localStorage.setItem('browserNetworkPage.paneWidth', action.width);
}

function* loadSettings() {
  const result = yield global.backendConn.send(
    'SettingsController',
    'index',
    {}
  );
  const settings = result.result.body;

  const interceptEnabledSetting = settings.find(
    setting => setting.key === 'interceptEnabled'
  );

  let interceptEnabled;

  if (interceptEnabledSetting === undefined) {
    interceptEnabled = false;
  } else {
    interceptEnabled = interceptEnabledSetting.value === '1';
  }

  yield put({
    type: 'SET_INTERCEPT_ENABLED',
    page: 'browserInterceptPage',
    interceptEnabled: interceptEnabled
  });
}

const appSagas = [
  takeLatest('LOAD_SETTINGS', loadSettings),
  takeLatest('SAVE_STATE', saveState),
  takeLatest('LOAD_STATE', loadState),
  takeLatest('SET_THEME_STORAGE', setThemeStorage),
  takeLatest('SET_ORIENTATION_STORAGE', setOrientationStorage),
  takeLatest('SET_TABLECOLUMNS_STORAGE', setTableColumnsStorage),
  takeLatest('SET_PANE_HEIGHT_STORAGE', setPaneHeightStorage),
  takeLatest('SET_PANE_WIDTH_STORAGE', setPaneWidthStorage)
];

export { appSagas };
