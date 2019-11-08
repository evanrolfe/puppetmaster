const puppeteer = require('puppeteer');
const instrumentBrowser = require('../lib/BrowserUtils');
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

    browser.title = `Session #${global.puppeteer_browsers.length + 1}`;

    global.puppeteer_browsers.push(browser);

    await instrumentBrowser(browser);

    ipc.send('browsersChanged', {});

    return { status: 'OK' };
  }

  async index() {
    const titles = global.puppeteer_browsers.map(browser => browser.title);

    return { status: 'OK', body: titles };
  }

  async bringToForeground(args) {
    const browser = global.puppeteer_browsers[args.browserIndex];
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
