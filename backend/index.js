const ipc = require('./server-ipc');
const { handleBrowserClosed } = require('./lib/BrowserUtils');
const InterceptServer = require('./lib/InterceptServer');

console.log('Starting backend server...');

global.puppeteer_browsers = [];

if (process.argv[2] === '--subprocess') {
  const socketName = process.argv[4];

  ipc.init(socketName, process.argv[5]);
} else {
  // eslint-disable-next-line global-require
  const { ipcRenderer } = require('electron');

  ipcRenderer.on('set-socket', (event, { name }) => {
    ipc.init(name, 'pntest-prod.db');
  });
}

const interceptServer = new InterceptServer();
interceptServer.init();
global.interceptServer = interceptServer;

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

  process.on(eventType, async () => {
    console.log('Exiting the backend server...');
    console.log(`Closing ${global.puppeteer_browsers.length} browsers...`);

    // eslint
    for (let j = 0; j < global.puppeteer_browsers.length; j++) {
      const browser = global.puppeteer_browsers[j];
      browser.close();
      // eslint-disable-next-line no-await-in-loop
      await handleBrowserClosed(browser);
    }

    return process.exit(0);
  });
}
