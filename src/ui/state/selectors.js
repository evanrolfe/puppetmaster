/* -----------------------------------------------------------------------------*
 * Requests
 * -----------------------------------------------------------------------------*/
const getSelectedRequestIds = state => {
  const selectedId1 = state.browserNetworkPage.selectedRequestId;
  const selectedId2 = state.browserNetworkPage.selectedRequestId2;
  const requestIds = state.browserNetworkPage.requests.map(r => r.id);

  const i1 = requestIds.indexOf(selectedId1);
  const i2 = requestIds.indexOf(selectedId2);
  let selectedRequestIds;

  if (i2 > i1) {
    selectedRequestIds = requestIds.slice(i1, i2 + 1);
  } else {
    selectedRequestIds = requestIds.slice(i2, i1 + 1);
  }

  return selectedRequestIds;
};

const isRequestSelected = (state, requestId) => {
  const selectedId1 = state.browserNetworkPage.selectedRequestId;
  const selectedId2 = state.browserNetworkPage.selectedRequestId2;

  if (selectedId2 !== null) {
    const selectedIds = getSelectedRequestIds(state);

    return selectedIds.includes(requestId);
  } else {
    return selectedId1 === requestId;
  }
};

const getRequest = (state, requestId) => {
  const requestIds = state.browserNetworkPage.requests.map(r => r.id);
  const index = requestIds.indexOf(requestId);

  return state.browserNetworkPage.requests[index];
};

/* -----------------------------------------------------------------------------*
 * Websocket Messages
 * -----------------------------------------------------------------------------*/
const getSelectedWebsocketMessageIds = state => {
  const selectedId1 = state.browserWebsocketsPage.selectedMessageId;
  const selectedId2 = state.browserWebsocketsPage.selectedMessageId2;
  const messageIds = state.browserWebsocketsPage.websocketMessages.map(
    r => r.id
  );

  const i1 = messageIds.indexOf(selectedId1);
  const i2 = messageIds.indexOf(selectedId2);
  let selectedMessageIds;

  if (i2 > i1) {
    selectedMessageIds = messageIds.slice(i1, i2 + 1);
  } else {
    selectedMessageIds = messageIds.slice(i2, i1 + 1);
  }

  return selectedMessageIds;
};

const isWebsocketMessageSelected = (state, websocketMessageId) => {
  const selectedId1 = state.browserWebsocketsPage.selectedMessageId;
  const selectedId2 = state.browserWebsocketsPage.selectedMessageId2;

  if (selectedId2 !== null) {
    const selectedIds = getSelectedWebsocketMessageIds(state);

    return selectedIds.includes(websocketMessageId);
  } else {
    return selectedId1 === websocketMessageId;
  }
};

const getWebsocketMessage = (state, websocketMessageId) => {
  const websocketMessageIds = state.browserWebsocketsPage.websocketMessages.map(
    wm => wm.id
  );
  const index = websocketMessageIds.indexOf(websocketMessageId);

  return state.browserWebsocketsPage.websocketMessages[index];
};

/* -----------------------------------------------------------------------------*
 * Panes
 * -----------------------------------------------------------------------------*/
const getPane = (state, paneId, pageName) => {
  const panes = state[pageName].page.panes;
  let paneFound;

  panes.forEach(pane => {
    if (pane.id === paneId) {
      paneFound = pane;
    } else if (pane.panes !== undefined) {
      pane.panes.forEach(subPane => {
        if (subPane.id === paneId) {
          paneFound = subPane;
        }
      });
    }
  });

  return paneFound;
};

const getParentPane = (state, paneId, pageName) => {
  const panes = state[pageName].page.panes;
  let paneFound;

  panes.forEach(pane => {
    if (pane.id === paneId) {
      paneFound = state[pageName].page;
    } else if (
      pane.panes !== undefined &&
      pane.panes.map(p => p.id).includes(paneId)
    ) {
      paneFound = pane;
    }
  });

  return paneFound;
};

export {
  isRequestSelected,
  getSelectedRequestIds,
  getRequest,
  isWebsocketMessageSelected,
  getSelectedWebsocketMessageIds,
  getWebsocketMessage,
  getPane,
  getParentPane
};
