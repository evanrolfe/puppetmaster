import { put, takeLatest } from 'redux-saga/effects';

function* loadBrowsers() {
  const result = yield global.backendConn.send(
    'BrowsersController',
    'index',
    {}
  );
  const browsers = result.result.body;

  yield put({
    type: 'BROWSERS_LOADED',
    browsers: browsers,
    page: 'browserNetworkPage'
  });
}

const browserSagas = [takeLatest('LOAD_BROWSERS', loadBrowsers)];

export { browserSagas };
