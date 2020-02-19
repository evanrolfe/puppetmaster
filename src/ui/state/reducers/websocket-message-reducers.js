import { ipcRenderer } from 'electron';

import { getSelectedWebsocketMessageIds } from '../selectors';
import { setNestedValue } from './utils';

const websocketMessagesLoaded = (state, action) => {
  ipcRenderer.send('websocketMessagesTabledChanged', {
    websocketMessages: action.websocketMessages
  });
  return setNestedValue('websocketMessages', state, action);
};

const websocketMessageLoaded = (state, action) =>
  setNestedValue('websocketMessage', state, action);

const websocketMessageDeleted = (state, action) => {
  let deletedIds;

  if (Array.isArray(action.websocketMessageId)) {
    deletedIds = action.websocketMessageId;
  } else {
    deletedIds = [action.websocketMessageId];
  }

  const newState = { ...state };

  newState.browserWebsocketsPage.websocketMessages = newState.browserWebsocketsPage.websocketMessages.filter(
    message => !deletedIds.includes(message.id)
  );

  // Clear the selected messages:
  newState.browserWebsocketsPage.selectedMessageId = null;
  newState.browserWebsocketsPage.selectedMessageId2 = null;

  return newState;
};

const selectWebsocketMessage = (state, action) => {
  let selectedMessageId2 = null;

  if (state.shiftPressed === true) {
    if (state.browserWebsocketsPage.selectedMessageId2 === null) {
      selectedMessageId2 = state.browserWebsocketsPage.selectedMessageId;
    } else {
      selectedMessageId2 = state.browserWebsocketsPage.selectedMessageId2;
    }
  }

  const newState = { ...state };
  newState[action.page].selectedMessageId = action.websocketMessageId;
  newState[action.page].selectedMessageId2 = selectedMessageId2;

  // Create the multiple requests context menu if necessary:
  if (selectedMessageId2 !== null) {
    const selectedMessageIds = getSelectedWebsocketMessageIds(newState);
    console.log(
      `[STATE] Create contenxt menu for(${selectedMessageIds.length}) websocket messages`
    );
    ipcRenderer.send('websocketMessagesSelected', {
      websocketMessageIds: selectedMessageIds
    });
  }

  console.log(
    `[WEBSOCKETREDUCERS] selected websocketMessage ${action.websocketMessageId}`
  );

  return newState;
};

const selectPrevWebsocketMessage = (state, action) => {
  const index = state[action.page].websocketMessages.findIndex(
    websocketMessage =>
      websocketMessage.id === state[action.page].selectedMessageId
  );
  const prevMessage = state[action.page].websocketMessages[index - 1];
  if (prevMessage === undefined) return state;

  return selectWebsocketMessage(state, {
    websocketMessageId: prevMessage.id,
    page: action.page
  });
};

const selectNextWebsocketMessage = (state, action) => {
  const index = state[action.page].websocketMessages.findIndex(
    websocketMessage =>
      websocketMessage.id === state[action.page].selectedMessageId
  );
  const nextMessage = state[action.page].websocketMessages[index + 1];
  if (nextMessage === undefined) return state;

  return selectWebsocketMessage(state, {
    websocketMessageId: nextMessage.id,
    page: action.page
  });
};

const websocketMessageReducers = {
  WEBSOCKET_MESSAGES_LOADED: websocketMessagesLoaded,
  WEBSOCKET_MESSAGE_LOADED: websocketMessageLoaded,
  WEBSOCKET_MESSAGE_DELETED: websocketMessageDeleted,
  SELECT_WEBSOCKET_MESSAGE: selectWebsocketMessage,
  SELECT_PREV_WEBSOCKET_MESSAGE: selectPrevWebsocketMessage,
  SELECT_NEXT_WEBSOCKET_MESSAGE: selectNextWebsocketMessage
};

export { websocketMessageReducers };
