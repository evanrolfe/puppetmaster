/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import MenuBuilder from './menu';
import BackendServerStarter from './lib/BackendServerStarter';

const DEBUG_BACKEND = false;

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'verbose';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let backendProcess;
let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

/**
 * Add event listeners...
 */
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }

  console.log(`Killing backend server process...`);
  backendProcess.kill('SIGHUP');
});

app.on('ready', async () => {
  // TODO: Remove this hardcoded server socket, and also from app/App.js
  const serverSocket = 'pntest1';
  /*
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    BackendServerStarter.createBackgroundWindow(serverSocket);
    // await installExtensions();
  } else {
  }
*/
  log.warn('App ready.');

  if (DEBUG_BACKEND === true) {
    log.warn('Starting background server in debug mode...');
    backendProcess = BackendServerStarter.createBackgroundWindow(
      serverSocket,
      app
    );
  } else {
    log.warn('Starting background server...');
    backendProcess = BackendServerStarter.createBackgroundProcess(
      serverSocket,
      app,
      'pntest-prod.db'
    );
  }

  log.warn('Started.');

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    }
  });

  log.warn('MainWindow opened.');

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
});

/* -----------------------------------------------------------------------------*
 * IPC Communication with the renderer process
 * -----------------------------------------------------------------------------*/
const requestContextMenus = {};
let multipleRequestsMenu;

const deleteClicked = requestId => {
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
        mainWindow.webContents.send('deleteRequest', { requestId: requestId });
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

const deleteMultipleClicked = requestIds => {
  const promise = dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title: 'Delete requests',
    message: `Are you sure you want to delete ${
      requestIds.length
    } selected requests?`,
    buttons: ['Cancel', 'Delete']
  });

  promise
    .then(result => {
      const buttonClicked = result.response;
      if (buttonClicked === 1) {
        mainWindow.webContents.send('deleteRequest', { requestId: requestIds });
      }

      return true;
    })
    .catch(console.log);
};

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
