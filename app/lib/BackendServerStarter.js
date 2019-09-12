import path from 'path';
import { BrowserWindow } from 'electron';
import { fork } from 'child_process';

export default {
  createBackgroundProcess(socketName, app, dbFile) {
    console.log(`Starting background Process...`);
    const serverProcess = fork('./backend/index.js', [
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
  createBackgroundWindow(socketName) {
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

    const file = path.join(__dirname, '../../backend/server-dev.html');

    win.loadURL(`file://${file}`);

    win.webContents.on('did-finish-load', () => {
      win.webContents.send('set-socket', { name: socketName });
    });
  }
};
