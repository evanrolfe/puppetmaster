const puppeteer = require('puppeteer');
const { instrumentBrowser } = require('../lib/BrowserUtils');
const ipc = require('../server-ipc');

class BrowsersController {
  // POST /browsers
  async create() {
    // See: https://github.com/GoogleChrome/puppeteer/issues/2134

    // TODO: Move this logic to BrowserUtils:
    const puppeteerExec = puppeteer
      .executablePath()
      .replace('app.asar', 'app.asar.unpacked');

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: puppeteerExec,
      args: []
    });

    const result = await global.dbStore
      .connection('browsers')
      .insert({ open: 1, created_at: Date.now() });
    const browserId = result[0];
    // Set the default title:
    await global.dbStore
      .connection('browsers')
      .where({ id: browserId })
      .update({ title: `Session #${browserId}` });
    browser.id = browserId;
    global.puppeteer_browsers.push(browser);

    await instrumentBrowser(browser);

    ipc.send('browsersChanged', {});

    return { status: 'OK' };
  }

  async open(args) {
    // args.browserId
    const result = await global.dbStore
      .connection('browsers')
      .where({ id: args.browserId });
    const browser = result[0];

    if (browser.open === 1) {
      this.bringToForeground(args);
    } else {
      // TODO
    }
  }

  async index() {
    const browsers = await global.dbStore.connection('browsers');

    return { status: 'OK', body: browsers };
  }

  async bringToForeground(args) {
    const browser = global.puppeteer_browsers.find(
      browserEnum => browserEnum.id === args.browserId
    );
    const target = browser
      .targets()
      .find(targetEnum => targetEnum._targetInfo.type === 'page');
    console.log(`[Backend] opening the browser target ${target._targetId}`);
    console.log(target);

    const cdpSession = await target.createCDPSession();
    await cdpSession.send('Target.activateTarget', {
      targetId: target._targetId
    });
    console.log(`[Backend] opened!`);
  }
}

module.exports = BrowsersController;
