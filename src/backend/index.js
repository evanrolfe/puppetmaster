import ipc from '../shared/ipc-server';
import { DATABASE_FILES, BACKEND_SOCKET_NAMES } from '../shared/constants';

import database from './lib/database';
import BrowserUtils from './lib/BrowserUtils';
import InterceptServer from './lib/InterceptServer';

// Controllers:
import BrowsersController from './controllers/BrowsersController';
import CaptureFiltersController from './controllers/CaptureFiltersController';
import RequestsController from './controllers/RequestsController';
import SettingsController from './controllers/SettingsController';

const handleExit = async () => {
  console.log('Exiting the backend server...');
  console.log(`Closing ${global.puppeteer_browsers.length} browsers...`);

  // eslint
  for (let j = 0; j < global.puppeteer_browsers.length; j++) {
    const browser = global.puppeteer_browsers[j];
    browser.close();

    // eslint-disable-next-line no-await-in-loop
    await BrowserUtils.handleBrowserClosed(browser);
  }

  return process.exit(0);
};

if (process.env.NODE_ENV === undefined) {
  throw new Error(
    `You must set the NODE_ENV var!\ni.e. NODE_ENV=development yarn start-backend`
  );
}

// Start the backend:
(async () => {
  try {
    console.log(`Starting backend server in mode: ${process.env.NODE_ENV}`);
    const dbFile = DATABASE_FILES[process.env.NODE_ENV];
    const socketName = BACKEND_SOCKET_NAMES[process.env.NODE_ENV];
    global.puppeteer_browsers = [];

    // Load the database
    global.knex = await database.setupDatabaseStore(dbFile);
    console.log(`[Backend] Database loaded`);

    // Load the IPC Server
    const controllersMap = {
      BrowsersController: BrowsersController,
      CaptureFiltersController: CaptureFiltersController,
      RequestsController: RequestsController,
      SettingsController: SettingsController
    };
    await ipc.init(socketName, controllersMap);
    console.log(`[Backend] IPC server started`);

    // Load the Intercept IPC Server
    const interceptServer = new InterceptServer();
    interceptServer.init();
    global.interceptServer = interceptServer;
    console.log(`[Backend] Intercept server started`);

    // IMPORTANT: DO NOT CHANGE THIS LINE!
    // It is use by other processes to know when the backend has finished loading.
    console.log(`[Backend] LOADED`);
  } catch (e) {
    console.log(e);
  }
})();

// Handle exiting:
// TODO: Maybe use this package? https://www.npmjs.com/package/signal-exit
const events = [
  `SIGINT`,
  `SIGUSR1`,
  `SIGUSR2`,
  `uncaughtException`,
  `SIGTERM`,
  `SIGHUP`
];

for (let i = 0; i < events.length; i++) {
  const eventType = events[i];
  process.on(eventType, handleExit);
}
