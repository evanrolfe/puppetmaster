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
      Request.createFromBrowserResponse(page, response);
      ipc.send('requestCreated', {});
    });

    // Intercept any new tabs created in the browser:
    puppeteerBrowser.on('targetcreated', async target => {
      console.log('New target created');
      const newPage = await target.page();

      newPage.on('response', async response => {
        Request.createFromBrowserResponse(newPage, response);
        ipc.send('requestCreated', {});
      });
    });

    return { status: 'OK' };
  }
}

module.exports = BrowsersController;
