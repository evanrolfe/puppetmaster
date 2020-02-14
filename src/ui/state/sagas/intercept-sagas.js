import ipc from 'node-ipc';
import { select, put, takeLatest } from 'redux-saga/effects';
import { INTERCEPT_SOCKET_NAMES } from '../../../shared/constants';

const interceptRequestIPC = async params =>
  new Promise(resolve => {
    console.log(`[STATE] starting interceptRequestIPC...`);
    const socketName = INTERCEPT_SOCKET_NAMES[process.env.NODE_ENV];

    ipc.connectTo(socketName, () => {
      console.log(`[STATE] connecting to ${socketName} IPC`);

      ipc.of[socketName].on('connect', () => {
        console.log(`[STATE] sending IPC intercept message...`);

        ipc.of[socketName].emit('message', params);
        ipc.disconnect(socketName);
        resolve();
      });
    });
  });

function* sendInterceptCommand(args) {
  const request = yield select(state => state.browserInterceptPage.request);
  const requestHeadersText = yield select(
    state => state.browserInterceptPage.requestHeadersText
  );
  const requestPayloadText = yield select(
    state => state.browserInterceptPage.requestPayloadText
  );

  let params = {};

  if (['forward', 'forwardAndIntercept'].includes(args.action)) {
    if (request === null) return;

    params = {
      action: args.action,
      request: {
        id: request.id,
        rawRequest: requestHeadersText
      }
    };
  } else if (args.action === 'respond') {
    if (request === null) return;

    params = {
      action: args.action,
      request: {
        id: request.id,
        rawResponse: requestHeadersText,
        rawResponseBody: requestPayloadText
      }
    };
  } else if (args.action === 'disable') {
    params = { action: 'disable' };
  }

  yield interceptRequestIPC(params);

  yield put({
    type: 'SET_INTERCEPT_REQUEST',
    page: 'browserInterceptPage',
    request: null
  });
}

const interceptSagas = [
  takeLatest('SEND_INTERCEPT_COMMAND', sendInterceptCommand)
];

export { interceptSagas };
