import puppeteer from 'puppeteer';
import { DEFAULT_FILTERS } from '../../src/shared/constants';

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

    const filters = Object.assign({}, DEFAULT_FILTERS);
    filters.hostList = ['localhost'];

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
      expect(request.host).to.eql('localhost');
      expect(request.path).to.eql('/api/posts.json');
      expect(request.ext).to.eql('json');

      expect(request.response_status).to.eql(200);
    });
  });
});