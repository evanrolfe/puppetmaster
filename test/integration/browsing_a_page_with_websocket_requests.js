import { sleep, clearDatabase, openBrowser } from '../utils';

describe('Browsing a page with websocket requests', () => {
  let browser;

  beforeEach(async () => {
    await clearDatabase();
    browser = await openBrowser();
  });

  afterEach(async () => {
    browser.close();
  });

  describe('navigating to http://localhost/chat', () => {
    it('works', async () => {
      const pages = await browser.pages();
      const page = pages[0];
      await page.goto('http://localhost/chat');
      await sleep(500);

      const dbResult = await global
        .knex('requests')
        .where({ url: 'ws://localhost:3002/' });
      const wsRequest = dbResult[0];

      const expectedValues = {
        browser_id: 1,
        method: 'GET',
        url: 'ws://localhost:3002/',
        host: 'localhost:3002',
        port: 3002,
        http_version: '1.1',
        path: '/',
        request_type: 'websocket',
        response_status: 101,
        response_status_message: 'Switching Protocols'
      };

      Object.keys(expectedValues).forEach(key => {
        expect(wsRequest[key]).to.eql(expectedValues[key]);
      });

      expect(wsRequest.websocket_request_id).to.have.lengthOf.above(0);
      expect(wsRequest.websocket_sec_key).to.have.lengthOf.above(0);
      expect(wsRequest.request_headers).to.have.lengthOf.above(0);
      expect(wsRequest.response_headers).to.have.lengthOf.above(0);
    });
  });
});
