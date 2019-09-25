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

    page.on('response', async response => {
      const remoteAddress = `${response.remoteAddress().ip}:${
        response.remoteAddress().port
      }`;

      const responseBody = await response.text();
      const cookies = await page.cookies();
      const cookiesStr = cookies
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');
      const responseHeaders = response.request().headers();
      responseHeaders.cookie = cookiesStr;

      global.db.run(
        'INSERT INTO requests (method, url, request_type, request_headers, request_payload, response_status, response_status_message, response_headers, response_remote_address, response_body) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
        response.request().method(),
        response.url(),
        response.request().resourceType(),
        JSON.stringify(responseHeaders),
        JSON.stringify(response.request().postData()),
        response.status(),
        response.statusText(),
        JSON.stringify(response.headers()),
        remoteAddress,
        responseBody
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
