import { put, takeLatest, takeEvery, select } from 'redux-saga/effects';

function* loadRequests() {
  const filters = yield select(state => state.browserNetworkPage.filters);
  const orderBy = yield select(state => state.browserNetworkPage.orderBy);
  const dir = yield select(state => state.browserNetworkPage.dir);

  const params = { ...filters, order_by: orderBy, dir: dir };

  const response = yield global.backendConn.send(
    'RequestsController',
    'index',
    params
  );

  const requests = response.result.body;

  yield put({
    type: 'REQUESTS_LOADED',
    requests: requests,
    page: 'browserNetworkPage'
  });
}

function* loadRequest() {
  const requestId = yield select(
    state => state.browserNetworkPage.selectedRequestId
  );

  const response = yield global.backendConn.send('RequestsController', `show`, {
    id: requestId
  });
  const request = response.result.body;

  yield put({
    type: 'REQUEST_LOADED',
    request: request,
    page: 'browserNetworkPage'
  });
}

function* deleteRequest(action) {
  yield global.backendConn.send('RequestsController', 'delete', {
    id: action.requestId
  });
}

function* selectRequestLoad(action) {
  yield put({
    type: 'SELECT_REQUEST',
    requestId: action.request.id,
    page: 'browserNetworkPage'
  });
  yield put({ type: 'LOAD_REQUEST' });
}

function* selectPrevRequestLoad() {
  yield put({ type: 'SELECT_PREV_REQUEST', page: 'browserNetworkPage' });
  yield put({ type: 'LOAD_REQUEST' });
}

function* selectNextRequestLoad() {
  yield put({ type: 'SELECT_NEXT_REQUEST', page: 'browserNetworkPage' });
  yield put({ type: 'LOAD_REQUEST' });
}

function* searchRequests(action) {
  yield put({
    type: 'SET_SEARCH',
    value: action.value,
    page: 'browserNetworkPage'
  });
  yield put({ type: 'LOAD_REQUESTS' });
}

function* filterRequests(action) {
  yield put({
    type: 'SET_FILTERS',
    filters: action.filters,
    page: 'browserNetworkPage'
  });
  yield put({ type: 'LOAD_REQUESTS' });
}

function* toggleColumnOrderRequests(action) {
  yield put({
    type: 'TOGGLE_COLUMN_ORDER',
    columnKey: action.columnKey,
    page: action.page
  });
  yield put({ type: 'LOAD_REQUESTS' });
}

const requestSagas = [
  takeLatest('LOAD_REQUESTS', loadRequests),
  takeLatest('LOAD_REQUEST', loadRequest),
  takeEvery('DELETE_REQUEST', deleteRequest),
  takeLatest('SEARCH_REQUESTS', searchRequests),
  takeLatest('FILTER_REQUESTS', filterRequests),
  takeLatest('TOGGLE_COLUMN_ORDER_REQUESTS', toggleColumnOrderRequests),
  takeLatest('SELECT_REQUEST_LOAD', selectRequestLoad),
  takeLatest('SELECT_PREV_REQUEST_LOAD', selectPrevRequestLoad),
  takeLatest('SELECT_NEXT_REQUEST_LOAD', selectNextRequestLoad)
];

export { requestSagas };
