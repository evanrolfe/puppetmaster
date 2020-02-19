import { ipcRenderer } from 'electron';

const listenForWebsocketMessages = dispatch => {
  // This is receive from the main process once a user right-clicks delete
  // NOTE: This fires twice when the event is received for some reason
  ipcRenderer.on('deleteWebsocketMessage', (event, args) => {
    dispatch({
      type: 'DELETE_WEBSOCKET_MESSAGE',
      websocketMesageId: args.websocketMesageId
    });
  });

  // This is received from the backend once the request has been deleted
  global.backendConn.listen('websocketMessageDeleted', args => {
    console.log(
      `Recieve websocketMessageDeleted with ${args.websocketMessageId}`
    );
    dispatch({
      type: 'WEBSOCKET_MESSAGE_DELETED',
      websocketMessageId: args.websocketMessageId
    });
  });
};

export { listenForWebsocketMessages };
