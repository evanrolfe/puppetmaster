const puppeteer = require('puppeteer');
const instrumentBrowser = require('../../../backend/lib/BrowserUtils');

const sleep = n => new Promise(resolve => setTimeout(resolve, n));

describe('BrowsersUtils', () => {
  let browser;

  before(async () => {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: []
    });

    await instrumentBrowser(browser);
  });

  beforeEach(async () => {
    await global.dbStore.connection.raw('Delete FROM requests;');
    await global.dbStore.connection.raw(
      'DELETE FROM SQLITE_SEQUENCE WHERE name="requests";'
    );
  });
  /*
  describe('navigating to http://localhost', () => {
    it('works', async () => {
      const pages = await browser.pages();
      const page = pages[0];
      await page.goto('http://localhost')
      await sleep(200);

      // Creates 8 requests
      let result = await global.dbStore.connection('requests').count('*')
      const requestsCount = result[0]['count(*)'];
      expect(requestsCount).to.eql(8);

      // The first request is GET http://localhost/
      result = await global.dbStore.connection('requests').where({id: 1})
      const request = result[0];
      expect(request.method).to.eql('GET')
      expect(request.url).to.eql('http://localhost/')
      expect(request.request_type).to.eql('document')
      expect(request.response_body.includes('<noscript>')).to.eql(true)
      expect(request.response_body_rendered.includes('<noscript>')).to.eql(false)
      expect(request.response_body_rendered.includes('Are you logged in?')).to.eql(true)
    });
  });
*/
  describe('navigating to http://localhost:3001', () => {
    it('works', async () => {
      const pages = await browser.pages();
      const page = pages[0];
      await page.goto('http://localhost:3001');
      await sleep(200);

      // Creates 18 requests
      let result = await global.dbStore.connection('requests').count('*');
      const requestsCount = result[0]['count(*)'];
      expect(requestsCount).to.eql(18);

      // The first request is GET http://localhost/
      result = await global.dbStore.connection('requests').where({ id: 1 });
      const request = result[0];
      expect(request.method).to.eql('GET');
      expect(request.url).to.eql('http://localhost:3001/');
      expect(request.request_type).to.eql('document');
      expect(request.response_body.includes('<td>Hello</td>')).to.eql(true);
      expect(request.response_body_rendered.includes('<td>Hello</td>')).to.eql(
        true
      );
    });
  });

  after(async () => {
    browser.close();
  });
});
