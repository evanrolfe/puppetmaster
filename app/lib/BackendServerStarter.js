import path from 'path';
import { fork } from 'child_process';

export default {
  createBackgroundProcess(socketName, app) {
    console.log(`Starting background Process...`);

    // TODO: THis is only run in production so should be ./dist/backend.js
    const serverPath = `${path.join(
      app.getAppPath()
    )}/src/backend/index.prod.js`;

    console.log(`Starting server from: ${serverPath}`);

    const serverProcess = fork(serverPath);

    serverProcess.on('message', msg => {
      console.log(msg);
    });

    return serverProcess;
  }
};
