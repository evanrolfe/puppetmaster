import { ipcMain, Menu, MenuItem, dialog } from 'electron';

const setupRequestContextMenus = mainWindow => {
  const requestContextMenus = {};
  let multipleRequestsMenu;

  const deleteClicked = requestId => {
    console.log(`[Main] Delete clicked.`);
    const promise = dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Delete request',
      message: `Are you sure you want to delete request ID ${requestId}?`,
      buttons: ['Cancel', 'Delete']
    });

    promise
      .then(result => {
        const buttonClicked = result.response;
        if (buttonClicked === 1) {
          console.log(`[Main] deleting request ${requestId}!`);
          mainWindow.webContents.send('deleteRequest', {
            requestId: requestId
          });
        }

        return true;
      })
      .catch(console.log);
  };

  const deleteMultipleClicked = requestIds => {
    const promise = dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Delete requests',
      message: `Are you sure you want to delete ${requestIds.length} selected requests?`,
      buttons: ['Cancel', 'Delete']
    });

    promise
      .then(result => {
        const buttonClicked = result.response;
        if (buttonClicked === 1) {
          mainWindow.webContents.send('deleteRequest', {
            requestId: requestIds
          });
        }

        return true;
      })
      .catch(console.log);
  };

  // NOTE: This logic was moved from the renderer proc to here because calling
  // creating the menu items was much slowerer in the render than in the main.
  ipcMain.on('requestsChanged', (event, args) => {
    args.requests.forEach(request => {
      const menu = new Menu();
      const menuItem = new MenuItem({
        label: 'Delete request',
        click: deleteClicked.bind(null, request.id)
      });
      menu.append(menuItem);
      requestContextMenus[request.id] = menu;
    });
  });

  // When a request is right-clicked:
  ipcMain.on('showRequestContextMenu', (event, args) => {
    requestContextMenus[args.requestId].popup({ window: mainWindow });
  });

  // When multiple requests are selected, create a context menu for them:
  ipcMain.on('requestsSelected', (event, args) => {
    console.log(`[Main] requestsSelected`);

    const menu = new Menu();
    const menuItem = new MenuItem({
      label: `Delete selected requests`,
      click: deleteMultipleClicked.bind(null, args.requestIds)
    });
    menu.append(menuItem);
    multipleRequestsMenu = menu;
  });

  // When multiple selected requests are right-clicked:
  ipcMain.on('showMultipleRequestContextMenu', () => {
    multipleRequestsMenu.popup({ window: mainWindow });
  });
};

export { setupRequestContextMenus };
