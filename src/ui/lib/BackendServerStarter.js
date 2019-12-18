import path from 'path';
import { fork } from 'child_process';

export default {
  createBackgroundProcess(app) {
    console.log(`Starting background Process...`);

    let serverPath = path.join(app.getAppPath());
    let serverProcess;

    if (process.env.NODE_ENV === 'production') {
      if (app.isPackaged === true) serverPath += '/dist';
      serverPath += '/backend.prod.js';
      console.log(`Starting server from: ${serverPath}`);
      serverProcess = fork(serverPath, ['-r @babel/register']);
    }
    /*
    else if(process.env.NODE_ENV === 'test') {
      serverPath += '/src/backend/index.js';
      console.log(`Loading test backend`)

      // In test mode we need to use babel-node in order to compile ES6 imports
      serverProcess = fork(serverPath, ['-r @babel/register'], {execPath: ''});
    }
*/
    serverProcess.on('message', msg => {
      console.log(msg);
    });

    return serverProcess;
  }
};
