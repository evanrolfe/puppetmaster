import path from 'path';
import { before, after } from 'mocha';
import { expect } from 'chai';
import { spawn } from 'child_process';

import BackendConn from '../src/ui/lib/BackendConnection';
import database from '../src/backend/lib/database';
import { DATABASE_FILES, MAIN_SOCKET_NAMES } from '../src/shared/constants';

global.expect = expect;
global.rootPath = path.join('../app/', '');

let serverProcess;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const noBackend =
  process.argv.includes('--no-backend') || process.argv.includes('-nb');

before(async () => {
  if (!noBackend) {
    console.log('Spawning backend process...');
    console.log(noBackend);
    serverProcess = spawn('yarn', ['start-backend'], {
      shell: true,
      env: process.env,
      stdio: 'inherit',
      detached: true
    })
      .on('close', code => process.exit(code))
      .on('error', spawnError => console.error(spawnError));

    // HACK: Currently serverProcess does not know when the backend has finished
    // loading, so we just sleep and hope for the best. Adjust this as needed.
    // TODO: Find a better way, perhaps by checking stdout for the word "loaded",
    // or maybe have the backend send an IPC messsage "loaded"?
    await sleep(500);

    console.log(`server Process created.`);
  }

  const dbFile = DATABASE_FILES[process.env.NODE_ENV];
  const socketName = MAIN_SOCKET_NAMES[process.env.NODE_ENV];

  global.backendConn = new BackendConn(socketName);
  await global.backendConn.init();
  global.knex = await database.setupDatabaseStore(dbFile);
});

after(() => {
  global.knex.destroy();
  global.backendConn.disconnect();

  // See this: https://azimi.me/2014/12/31/kill-child_process-node-js.html
  if (!noBackend) process.kill(-serverProcess.pid);
});
