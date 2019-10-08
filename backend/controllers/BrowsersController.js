const puppeteer = require('puppeteer');
const Request = require('../models/Request');
const ipc = require('../server-ipc');

class BrowsersController {
  // POST /browsers
  async create() {
    // See: https://github.com/GoogleChrome/puppeteer/issues/2134
    const puppeteerExec = puppeteer
      .executablePath()
      .replace('app.asar', 'app.asar.unpacked');
    console.log(puppeteerExec);

    const puppeteerBrowser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: puppeteerExec,
      args: []
    });

    global.puppeteer_browsers.push(puppeteerBrowser);

    const pages = await puppeteerBrowser.pages();
    const page = pages[0];

    page.on('response', async response => {
      ipc.send('requestCreated', {});
      Request.createFromBrowserResponse(page, response);
    });

    return { status: 'OK' };
  }
}

module.exports = BrowsersController;
