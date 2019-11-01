const puppeteer = require('puppeteer');
const instrumentBrowser = require('../lib/BrowserUtils');

class BrowsersController {
  // POST /browsers
  async create() {
    // See: https://github.com/GoogleChrome/puppeteer/issues/2134
    const puppeteerExec = puppeteer
      .executablePath()
      .replace('app.asar', 'app.asar.unpacked');

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: puppeteerExec,
      args: []
    });

    global.puppeteer_browsers.push(browser);

    await instrumentBrowser(browser);

    return { status: 'OK' };
  }
}

module.exports = BrowsersController;
