import path from 'path';
import { before, after } from 'mocha';
import { expect } from 'chai';
import Backend from '../app/lib/BackendServerStarter';
import BackendConn from '../app/lib/BackendConnection';

global.expect = expect;
global.rootPath = path.join(__dirname, '../');

let serverProcess;

before(async () => {
  const appMock = {
    getVersion() {
      return '1.2.3';
    }
  };
  serverProcess = Backend.createBackgroundProcess(
    'testapp1',
    appMock,
    'pntest-test.db'
  );
  global.backendConn = new BackendConn('testapp1');
  await global.backendConn.init();
});

after(() => {
  global.backendConn.disconnect();
  serverProcess.kill('SIGHUP');
  console.log('Process killed.');
});
