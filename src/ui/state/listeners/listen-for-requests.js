import { ipcRenderer } from 'electron';

const listenForRequests = dispatch => {
  // This is receive from the main process once a user right-clicks delete
  // NOTE: This fires twice when the event is received for some reason
  ipcRenderer.on('deleteRequest', (event, args) => {
    dispatch({ type: 'DELETE_REQUEST', requestId: args.requestId });
  });

  // This is received from the backend once the request has been deleted
  global.backendConn.listen('requestDeleted', args => {
    dispatch({ type: 'REQUEST_DELETED', requestId: args.requestId });
  });

  // Listen for new requests
  const dispatchLoadRequests = () => dispatch({ type: 'LOAD_REQUESTS' });
  // global.backendConn.listen('requestCreated', dispatchLoadRequests);

  global.proxyConn.listen('requestCreated', args => {
    dispatch({ type: 'REQUEST_CREATED', request: args.request });
  });

  // Listen for a change in browsers
  global.backendConn.listen('browsersChanged', dispatchLoadRequests);
};

export { listenForRequests };
