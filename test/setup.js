import path from 'path';
import { before, after } from 'mocha';
import { expect } from 'chai';
import SqliteAsync from 'sqlite-async';

import Backend from '../app/lib/BackendServerStarter';
import BackendConn from '../app/lib/BackendConnection';

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

  global.db = await SqliteAsync.open('pntest-test.db');
});

after(() => {
  global.backendConn.disconnect();
  serverProcess.kill('SIGHUP');
  console.log('Process killed.');
});
