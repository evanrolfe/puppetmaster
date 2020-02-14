import { put, takeLatest, takeEvery, select } from 'redux-saga/effects';

function* loadWebsocketMessages() {
  const filters = yield select(state => state.browserWebsocketsPage.filters);
  const orderBy = yield select(state => state.browserWebsocketsPage.orderBy);
  const dir = yield select(state => state.browserWebsocketsPage.dir);

  const response = yield global.backendConn.send(
    'WebsocketMessagesController',
    'index',
    { order_by: orderBy, dir: dir, ...filters }
  );

  const websocketMessages = response.result.body;

  yield put({
    type: 'WEBSOCKET_MESSAGES_LOADED',
    websocketMessages: websocketMessages,
    page: 'browserWebsocketsPage'
  });
}

function* loadWebsocketMessage() {
  const messageId = yield select(
    state => state.browserWebsocketsPage.selectedMessageId
  );

  const response = yield global.backendConn.send(
    'WebsocketMessagesController',
    `show`,
    {
      id: messageId
    }
  );
  const websocketMessage = response.result.body;

  yield put({
    type: 'WEBSOCKET_MESSAGE_LOADED',
    websocketMessage: websocketMessage,
    page: 'browserWebsocketsPage'
  });
}

function* deleteWebsocketMessage(action) {
  yield global.backendConn.send('WebsocketMessagesController', 'delete', {
    id: action.websocketMesageId
  });
}

function* selectWebsocketMessageLoad(action) {
  yield put({
    type: 'SELECT_WEBSOCKET_MESSAGE',
    websocketMessageId: action.websocketMessage.id,
    page: 'browserWebsocketsPage'
  });
  yield put({ type: 'LOAD_WEBSOCKET_MESSAGE' });
}

function* selectPrevWebsocketMessageLoad() {
  yield put({
    type: 'SELECT_PREV_WEBSOCKET_MESSAGE',
    page: 'browserWebsocketsPage'
  });
  yield put({ type: 'LOAD_WEBSOCKET_MESSAGE' });
}

function* selectNextWebsocketMessageLoad() {
  yield put({
    type: 'SELECT_NEXT_WEBSOCKET_MESSAGE',
    page: 'browserWebsocketsPage'
  });
  yield put({ type: 'LOAD_WEBSOCKET_MESSAGE' });
}

function* searchWebsocketMessages(action) {
  yield put({
    type: 'SET_SEARCH',
    value: action.value,
    page: 'browserWebsocketsPage'
  });
  yield put({ type: 'LOAD_WEBSOCKET_MESSAGES' });
}

function* toggleColumnOrderMessages(action) {
  yield put({
    type: 'TOGGLE_COLUMN_ORDER',
    columnKey: action.columnKey,
    page: action.page
  });
  yield put({ type: 'LOAD_WEBSOCKET_MESSAGES' });
}

const websocketMessageSagas = [
  takeLatest('LOAD_WEBSOCKET_MESSAGES', loadWebsocketMessages),
  takeLatest('LOAD_WEBSOCKET_MESSAGE', loadWebsocketMessage),
  takeLatest('TOGGLE_COLUMN_ORDER_MESSAGES', toggleColumnOrderMessages),
  takeLatest('SEARCH_WEBSOCKET_MESSAGES', searchWebsocketMessages),
  takeLatest('SELECT_WEBSOCKET_MESSAGE_LOAD', selectWebsocketMessageLoad),
  takeLatest(
    'SELECT_PREV_WEBSOCKET_MESSAGE_LOAD',
    selectPrevWebsocketMessageLoad
  ),
  takeLatest(
    'SELECT_NEXT_WEBSOCKET_MESSAGE_LOAD',
    selectNextWebsocketMessageLoad
  ),
  takeEvery('DELETE_WEBSOCKET_MESSAGE', deleteWebsocketMessage)
];

export { websocketMessageSagas };
