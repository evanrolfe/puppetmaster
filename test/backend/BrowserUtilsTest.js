/*
import puppeteer from 'puppeteer';

const sleep = n => new Promise(resolve => setTimeout(resolve, n));

describe('BrowsersUtils', () => {
  let browser;

  beforeEach(async () => {
    await global.knex.raw('Delete FROM browsers;');
    await global.knex.raw('DELETE FROM SQLITE_SEQUENCE WHERE name="browsers";');
    await global.knex.raw('Delete FROM capture_filters;');
    await global.knex.raw(
      'DELETE FROM SQLITE_SEQUENCE WHERE name="capture_filters";'
    );
    await global.knex.raw('Delete FROM requests;');
    await global.knex.raw('DELETE FROM SQLITE_SEQUENCE WHERE name="requests";');

    const filters = {
      hostList: [],
      hostSetting: 'include',
      pathList: ['/sockjs-node'],
      pathSetting: 'exclude',
      extList: ['js', 'css', 'ico'],
      extSetting: 'exclude',
      resourceTypes: [
        'document',
        'eventsource',
        'fetch',
        'font',
        'image',
        'manifest',
        'media',
        'navigation',
        'other',
        'stylesheet',
        'script',
        'texttrack',
        'websocket',
        'xhr'
      ]
    };

    await global
      .knex('capture_filters')
      .insert({ id: 1, filters: JSON.stringify(filters) });

    await backendConn.send('BrowsersController', 'create', {});

    // Connect to the browser we just opened so we can control it:
    browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
  });

  afterEach(async () => {
    browser.close();
  });

  describe('navigating to http://localhost and clicking a link', () => {
    it('works', async () => {
      const pages = await browser.pages();
      const page = pages[0];
      await page.goto('http://localhost');
      await sleep(500);
      await page.click('#posts_link');
      await sleep(500);

      // Creates 8 requests
      let result = await global.knex('requests').count('*');
      const requestsCount = result[0]['count(*)'];
      expect(requestsCount).to.eql(4);

      // The GET http://localhost/ request is saved along with the rendered DOM
      result = await global
        .knex('requests')
        .where({ url: 'http://localhost/', method: 'GET' });
      let request = result[0];
      expect(request.request_type).to.eql('document');
      expect(request.response_body.includes('<noscript>')).to.eql(true);
      expect(request.response_body_rendered).to.contain('Are you logged in?');

      // The http://localhost/posts request is saved along with the rendered DOM
      result = await global
        .knex('requests')
        .where({ url: 'http://localhost/posts', request_type: 'navigation' });
      request = result[0];
      expect(request.method).to.eql(null);
      expect(request.response_body).to.eql(null);
      expect(request.response_body_rendered).to.contain(
        'Hey Bob, how are you?'
      );
    });
  });

  describe('navigating to http://localhost:3001', () => {
    it('works', async () => {
      const pages = await browser.pages();
      const page = pages[0];
      await page.goto('http://localhost:3001');
      await sleep(500);

      // Creates 18 requests
      let result = await global.knex('requests').count('*');
      const requestsCount = result[0]['count(*)'];
      expect(requestsCount).to.eql(1);

      // The first request is GET http://localhost/
      result = await global
        .knex('requests')
        .where({ url: 'http://localhost:3001/', method: 'GET' });
      const request = result[0];
      expect(request.request_type).to.eql('document');
      expect(request.response_body.includes('<td>Hello</td>')).to.eql(true);
      expect(request.response_body_rendered).to.contain('<td>Hello</td>');
    });
  });

  describe('navigating to http://localhost/api/posts.json', () => {
    it('works', async () => {
      const pages = await browser.pages();
      const page = pages[0];
      await page.goto('http://localhost/api/posts.json');
      await sleep(500);

      // Creates 8 requests
      const result = await global.knex('requests').count('*');
      const requestsCount = result[0]['count(*)'];
      expect(requestsCount).to.eql(1);

      const request = await global.knex('requests').first();

      expect(request.id).to.eql(1);
      expect(request.url).to.eql('http://localhost/api/posts.json');
    });
  });
});
*/
