import { sleep, clearDatabase, openBrowser } from '../utils';

describe('Browsing a page with XHR requests', () => {
  let browser;

  beforeEach(async () => {
    await clearDatabase();
    browser = await openBrowser();
  });

  afterEach(async () => {
    browser.close();
  });

  describe('navigating to http://localhost/posts', () => {
    it('works', async () => {
      const pages = await browser.pages();
      const page = pages[0];
      await page.goto('http://localhost/posts');
      await sleep(500);

      const requests = await global.knex('requests');

      const expectedUrls = [
        'http://localhost/posts',
        'http://localhost/static/js/bundle.js',
        'http://localhost/static/js/0.chunk.js',
        'http://localhost/static/js/main.chunk.js',
        'http://localhost/api/posts.json'
      ];

      const requestUrls = requests.map(r => r.url);

      expectedUrls.forEach(expectedUrl => {
        expect(requestUrls).to.include(expectedUrl);
      });
    });
  });
});
