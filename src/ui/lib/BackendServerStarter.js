import path from 'path';
import { fork } from 'child_process';

export default {
  createBackgroundProcess(socketName, app) {
    console.log(`Starting background Process...`);

    let serverPath = path.join(app.getAppPath());
    if (app.isPackaged === true) serverPath += '/dist';
    serverPath += '/backend.prod.js';

    console.log(`Starting server from: ${serverPath}`);

    const serverProcess = fork(serverPath);

    serverProcess.on('message', msg => {
      console.log(msg);
    });

    return serverProcess;
  }
};
