import path from 'path';
import { before, after } from 'mocha';
import { expect } from 'chai';

import Backend from '../app/lib/BackendServerStarter';
import BackendConn from '../app/lib/BackendConnection';
import { setupDatabaseStore } from '../backend/lib/database';

global.expect = expect;
global.rootPath = path.join('../app/', '');

let serverProcess;

before(async () => {
  const appMock = {
    getVersion() {
      return '1.2.3';
    },
    getAppPath() {
      return '';
    },
    isPackaged: true
  };

  serverProcess = Backend.createBackgroundProcess(
    'testapp1',
    appMock,
    'pntest-test.db'
  );

  global.backendConn = new BackendConn('testapp1');
  await global.backendConn.init();

  global.dbStore = await setupDatabaseStore('pntest-test.db');
});

after(() => {
  global.dbStore.close();
  global.backendConn.disconnect();
  serverProcess.kill('SIGHUP');
  console.log('Process killed.');
});
