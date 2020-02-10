import { ipcMain, Menu, MenuItem, dialog } from 'electron';

const setupWebsocketMessageContextMenus = mainWindow => {
  const websocketMessageContextMenus = {};
  let multipleWebsocketMessagesMenu;

  const deleteClicked = mesageId => {
    console.log(`[Main] Delete clicked.`);
    const promise = dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Delete websocket message',
      message: `Are you sure you want to delete websocket message ID ${mesageId}?`,
      buttons: ['Cancel', 'Delete']
    });

    promise
      .then(result => {
        const buttonClicked = result.response;
        if (buttonClicked === 1) {
          console.log(`[Main] deleting websocket ${mesageId}!`);

          mainWindow.webContents.send('deleteWebsocketMessage', {
            websocketMesageId: mesageId
          });
        }

        return true;
      })
      .catch(console.log);
  };

  const deleteMultipleClicked = websocketMessageIds => {
    const promise = dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Delete websocket messages',
      message: `Are you sure you want to delete ${websocketMessageIds.length} selected websocket messages?`,
      buttons: ['Cancel', 'Delete']
    });

    promise
      .then(result => {
        const buttonClicked = result.response;
        if (buttonClicked === 1) {
          mainWindow.webContents.send('deleteWebsocketMessage', {
            websocketMesageId: websocketMessageIds
          });
        }

        return true;
      })
      .catch(console.log);
  };

  ipcMain.on('websocketMessagesTabledChanged', (event, args) => {
    args.websocketMessages.forEach(websocketMessage => {
      const menu = new Menu();
      const menuItem = new MenuItem({
        label: 'Delete websocket message',
        click: deleteClicked.bind(null, websocketMessage.id)
      });
      menu.append(menuItem);
      websocketMessageContextMenus[websocketMessage.id] = menu;
    });
  });

  // When multiple websocketMessages are selected, create a context menu for them:
  ipcMain.on('websocketMessagesSelected', (event, args) => {
    console.log(`[Main] websocketMessagesSelected`);

    const menu = new Menu();
    const menuItem = new MenuItem({
      label: `Delete selected websocket messages`,
      click: deleteMultipleClicked.bind(null, args.websocketMessageIds)
    });
    menu.append(menuItem);
    multipleWebsocketMessagesMenu = menu;
  });

  // When a websocket message is right-clicked:
  ipcMain.on('showWebsocketMessageContextMenu', (event, args) => {
    console.log(`Showing context menu for message ${args.messageId}`);
    websocketMessageContextMenus[args.messageId].popup({ window: mainWindow });
  });

  // When multiple selected requests are right-clicked:
  ipcMain.on('showMultipleWebsocketMessageContextMenu', () => {
    multipleWebsocketMessagesMenu.popup({ window: mainWindow });
  });
};

export { setupWebsocketMessageContextMenus };
