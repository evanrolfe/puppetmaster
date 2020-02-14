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
};

export { listenForRequests };
