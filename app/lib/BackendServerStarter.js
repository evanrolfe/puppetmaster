import path from 'path';
import { BrowserWindow } from 'electron';
import { fork } from 'child_process';

export default {
  createBackgroundProcess(socketName, app, dbFile) {
    console.log(`Starting background Process...`);
    let backendDir;

    if (app.isPackaged) {
      backendDir = './backend';
    } else {
      backendDir = '../backend';
    }
    const serverPath = `${path.join(app.getAppPath(), backendDir)}/index.js`;

    console.log(`Starting server from: ${serverPath}`);

    const serverProcess = fork(serverPath, [
      '--subprocess',
      app.getVersion(),
      socketName,
      dbFile
    ]);

    serverProcess.on('message', msg => {
      console.log(msg);
    });

    return serverProcess;
  },
  createBackgroundWindow(socketName, app) {
    const win = new BrowserWindow({
      x: 500,
      y: 300,
      width: 700,
      height: 500,
      show: true,
      webPreferences: {
        nodeIntegration: true
      }
    });

    const backendPath = path.join(app.getAppPath(), '../backend');
    const file = `${backendPath}/server-dev.html`;

    win.loadURL(`file://${file}`);

    win.webContents.on('did-finish-load', () => {
      win.webContents.send('set-socket', { name: socketName });
    });
  }
};
