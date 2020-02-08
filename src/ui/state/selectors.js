/*
// TODO: This is an attempt to make getPane recursive:
const checkPane = (pane, paneId) => {
  console.log(`checkPane: checking ${pane.id}`)

  if(pane.id === paneId) {
    console.log(`checkPane: yes! found ${paneId}`)
    return pane;
  }

  if(pane.panes !== undefined && pane.panes.length > 0) {
    pane.panes.forEach((subPane) => {
      checkPane(subPane, paneId);
    })
  }
};

const getPane = (state, paneId) => {
  const panes = state.browserNetworkPage.page.panes;
  let result;

  panes.forEach((pane) => {
    console.log(`getPane: checking ${pane.id}`)
    const paneFound = checkPane(pane, paneId);

    if(paneFound !== undefined) {
      result = paneFound;
    }
  })

  return result;
};
*/

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

export { getPane, getParentPane };
