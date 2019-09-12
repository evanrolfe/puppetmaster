const puppeteer = require('puppeteer');

class BrowsersController {
  constructor(params) {
    this.params = params;
  }

  // POST /browsers
  async create() {
    const puppeteerBrowser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: []
    });
    global.puppeteer_browsers.push(puppeteerBrowser);

    const pages = await puppeteerBrowser.pages();
    const page = pages[0];

    page.on('response', response => {
      global.db.db.run(
        'INSERT INTO requests (method, url, response_status) VALUES (?, ?, ?);',
        response.request().method(),
        response.url(),
        response.status()
      );
    });

    return { status: 'OK' };
  }

  // GET /browsers
  index() {
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
