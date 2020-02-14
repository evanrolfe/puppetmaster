import { ipcRenderer } from 'electron';

const listenForRequests = dispatch => {
  // NOTE: This fires twice when the event is received for some reason
  ipcRenderer.on('deleteRequest', (event, args) => {
    dispatch({ type: 'DELETE_REQUEST', requestId: args.requestId });
  });
};

export { listenForRequests };
