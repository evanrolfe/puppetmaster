import path from 'path';
import { fork } from 'child_process';

export default class BackendProcHandler {
  setOptions(app, dbPath) {
    this.app = app;
    this.dbPath = dbPath;
  }

  setDbPath(dbPath) {
    this.dbPath = dbPath;
  }

  start() {
    let serverPath = path.join(this.app.getAppPath());

    if (process.env.NODE_ENV === 'production') {
      if (this.app.isPackaged === true) serverPath += '/dist';
      serverPath += '/backend.prod.js';

      const args = ['-r @babel/register', `-db ${this.dbPath}`];

      console.log(
        `Starting backend from: ${serverPath} with args: ${args.join(' ')}`
      );
      this.process = fork(serverPath, args);
    }

    this.process.on('message', msg => {
      console.log(msg);
    });

    return this.process;
  }

  kill() {
    this.process.kill('SIGHUP');
  }

  restart() {
    this.kill();
    this.start();
  }
}
