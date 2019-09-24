const puppeteer = require('puppeteer');

class BrowsersController {
  constructor(params) {
    this.params = params;
  }

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

    page.on('response', response => {
      global.db.run(
        'INSERT INTO requests (method, url, response_status, response_status_message) VALUES (?, ?, ?, ?);',
        response.request().method(),
        response.url(),
        response.status(),
        response.statusText()
      );
    });

    return { status: 'OK' };
  }

  // GET /browsers
  async index() {
    return { status: 'OK', body: [0, 1, 2, 3] };
  }

  // GET /browsers/123
  show() {
    return { status: 'OK', body: { id: this.params.id } };
  }

  // PATCH /browsers/123
  update() {
    return { status: 'INVALID' };
  }

  // DELETE /browsers/1232
  delete() {
    return { status: 'OK' };
  }
}

module.exports = BrowsersController;
