import ipc from './server-ipc';
import BrowserUtils from './lib/BrowserUtils';
import InterceptServer from './lib/InterceptServer';

console.log('Starting backend server...');

global.puppeteer_browsers = [];

const socketName = 'pntest1';

ipc.init(socketName, 'pntest-prod.db');

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
      await BrowserUtils.handleBrowserClosed(browser);
    }

    return process.exit(0);
  });
}
