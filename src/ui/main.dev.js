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
import { app, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';

import certUtils from '../shared/cert-utils';
import MenuBuilder from './menu';
import BackendProcHandler from './lib/BackendProcHandler';
import ProxyProcHandler from './lib/ProxyProcHandler';
import { DEFAULT_DB_FILE } from '../shared/constants';

import { setupRequestContextMenus } from './mainproc/request-context-menus';
import { setupWebsocketMessageContextMenus } from './mainproc/websocket-message-context-menus';

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
  const iconPath = path.join(__dirname, '../../resources/icons/512x512.png');
  console.log(iconPath);
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: iconPath,
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

  /* -----------------------------------------------------------------------------*
   * Context menus:
   * -----------------------------------------------------------------------------*/
  setupRequestContextMenus(mainWindow);
  setupWebsocketMessageContextMenus(mainWindow);

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
