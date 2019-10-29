const puppeteer = require('puppeteer');
const { handleNewPage } = require('../lib/BrowserUtils');

class BrowsersController {
  // POST /browsers
  async create() {
    // See: https://github.com/GoogleChrome/puppeteer/issues/2134
    const puppeteerExec = puppeteer
      .executablePath()
      .replace('app.asar', 'app.asar.unpacked');

    const puppeteerBrowser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: puppeteerExec,
      args: []
    });

    global.puppeteer_browsers.push(puppeteerBrowser);

    const pages = await puppeteerBrowser.pages();
    const page = pages[0];

    handleNewPage(page);

    // Intercept any new tabs created in the browser:
    puppeteerBrowser.on('targetcreated', async target => {
      const newPage = await target.page();
      handleNewPage(newPage);
    });

    return { status: 'OK' };
  }
}

module.exports = BrowsersController;
