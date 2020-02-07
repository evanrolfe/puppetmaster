import { sleep, clearDatabase, openBrowser } from '../utils';

describe('Browsing an API page', () => {
  let browser;

  beforeEach(async () => {
    await clearDatabase();
    browser = await openBrowser();
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
