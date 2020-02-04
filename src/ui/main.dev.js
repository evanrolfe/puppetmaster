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
import path from 'path';
import fs from 'fs';

import certUtils from '../shared/cert-utils';
import MenuBuilder from './menu';
import BackendProcHandler from './lib/BackendProcHandler';
import ProxyProcHandler from './lib/ProxyProcHandler';
import { DEFAULT_DB_FILE } from '../shared/constants';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'verbose';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const backendProcHandler = new BackendProcHandler();
const proxyProcHandler = new ProxyProcHandler();
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

  if (process.env.NODE_ENV === 'production') {
    console.log(`Killing backend & proxy server processes...`);
    backendProcHandler.kill();
    proxyProcHandler.kill();
  }
});

app.on('ready', async () => {
  log.info('App ready.');

  // IMPORTANT: This has to be done before the backend or proxy start!!!
  await certUtils.generateCertsIfNotExists();

  const dbPath = path.join(app.getPath('userData'), DEFAULT_DB_FILE);

  // Delete the temp project db file if it already exists:
  if (fs.existsSync(dbPath)) {
    log.info(`[MAIN] temp project already exists at: ${dbPath}, deleting..`);
    fs.unlinkSync(dbPath);
  }

  if (process.env.NODE_ENV === 'production') {
    log.info('[MAIN] Starting background server...');
    backendProcHandler.setOptions(app, dbPath);
    backendProcHandler.start();
  }

  if (process.env.NODE_ENV === 'production') {
    log.info('[MAIN] Starting proxy server...');
    proxyProcHandler.setOptions(app, dbPath);
    proxyProcHandler.start();
  }

  log.info('Started.');

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    }
  });

  const setNewProjectPath = filePath => {
    backendProcHandler.setDbPath(filePath);
    backendProcHandler.restart();

    proxyProcHandler.setDbPath(filePath);
    proxyProcHandler.restart();

    mainWindow.reload();
  };

  const openProject = filePath => {
    console.log(`Opening project! ${filePath}`);
    setNewProjectPath(filePath);
  };

  const saveProjectAs = filePath => {
    console.log(
      `Saving project as! From: ${backendProcHandler.dbPath} to: ${filePath}`
    );

    fs.copyFileSync(backendProcHandler.dbPath, filePath);

    setNewProjectPath(filePath);
  };

  log.info('MainWindow opened.');

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

  const menuBuilder = new MenuBuilder(mainWindow, openProject, saveProjectAs);
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

// When a request is right-clicked:
ipcMain.on('showRequestContextMenu', (event, args) => {
  requestContextMenus[args.requestId].popup({ window: mainWindow });
});

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
        mainWindow.webContents.send('deleteRequest', { requestId: requestIds });
      }

      return true;
    })
    .catch(console.log);
};

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
