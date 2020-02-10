import { ipcMain, Menu, MenuItem, dialog } from 'electron';

const setupWebsocketMessageContextMenus = mainWindow => {
  const websocketMessageContextMenus = {};
  // let multipleWebsocketMessagesMenu;

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

  // When a websocket message is right-clicked:
  ipcMain.on('showWebsocketMessageContextMenu', (event, args) => {
    console.log(`Showing context menu for message ${args.messageId}`);
    websocketMessageContextMenus[args.messageId].popup({ window: mainWindow });
  });
};

export { setupWebsocketMessageContextMenus };
