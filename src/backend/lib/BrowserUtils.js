// import { curly } from 'node-libcurl';
import puppeteer from 'puppeteer';

import mainIpc from '../../shared/ipc-server';
import certUtils from '../../shared/cert-utils';
import { handleNewPage } from './BrowserPageUtils';
/*
 * NOTE: For each response intercepted
 * If that request is a navigation request (i.e. a page displayed in the browser), then we start
 * the DOMListener, which saves the page's rendered DOM to request.response_body_rendered every
 * 100ms.
 *
 * For every page, we also listen for the framenavigated event, which creates a navigation request
 * and saves the rendered DOM to that request in the database, cancels the DOMListener and starts
 * a new one.
 *
 * Race Condition - this happens if you don't check the database inside the DOMListener callback:
 *
 * BrowserUtils: DOMListener 16 running...
 * BrowserUtils: saved content for page: http://localhost/ to request 1, (DOMListener 16)
 * BrowserUtils: DOMListener 16 running...
 * BrowserUtils: frameNavigated to http://localhost/posts
 * BrowserUtils: killed DomListener #16
 * BrowserUtils: saved content for page: http://localhost/posts to request 1, (DOMListener 16)
 * BrowserUtils: create new request 9 and starting DOMListener...
 * BrowserUtils: started domListener id 64
 * BrowserUtils: DOMListener 64 running...
 * BrowserUtils: saved content for page: http://localhost/posts to request 9, (DOMListener 64)
 */

const createBrowserDb = async () => {
  const result = await global
    .knex('browsers')
    .insert({ created_at: Date.now() });

  const browserId = result[0];

  await global
    .knex('browsers')
    .where({ id: browserId })
    .update({ title: `Session #${browserId}` });

  return browserId;
};

const getBrowserOptions = browserId => {
  const puppeteerExec = puppeteer
    .executablePath()
    .replace('app.asar', 'app.asar.unpacked');
  const spki = certUtils.getSPKIFingerprint();

  const options = {
    headless: false,
    defaultViewport: null,
    executablePath: puppeteerExec,
    userDataDir: `./tmp/browser${browserId}`,
    args: [
      `--ignore-certificate-errors-spki-list=${spki}`,
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials',
      '--proxy-server=127.0.0.1:8080',
      '--proxy-bypass-list=<-loopback>', // Allows you to access localhost
      '--disable-restore-session-state',
      '--no-default-browser-check',
      '--disable-sync'
    ]
  };

  if (process.env.NODE_ENV === 'test') {
    options.headless = true;
    options.args.push('--remote-debugging-port=9222');
  }

  return options;
};

const createBrowser = async () => {
  const browserId = await createBrowserDb();
  const options = getBrowserOptions(browserId);
  const browser = await puppeteer.launch(options);
  browser.id = browserId;
  global.puppeteer_browsers.push(browser);

  await instrumentBrowser(browser);

  mainIpc.send('browsersChanged', {});

  return browser;
};

const updateBrowser = async (browserId, title) => {
  await global
    .knex('browsers')
    .where({ id: browserId })
    .update({ title: title });

  mainIpc.send('browsersChanged', {});
};

// NOTE: Sessions are not preserved in usersdatadir, see:
// https://github.com/GoogleChrome/puppeteer/issues/1316
// https://stackoverflow.com/questions/57987585/puppeteer-how-to-store-a-session-including-cookies-page-state-local-storage
const openBrowser = async browserId => {
  console.log(`[BrowserUtils] opening browser ${browserId}`);
  const options = getBrowserOptions(browserId);
  const browser = await puppeteer.launch(options);

  // Store in global vars
  browser.id = browserId;
  global.puppeteer_browsers.push(browser);

  // Load the cookies:
  const result = await global.knex('browsers').where({ id: browserId });
  const browserRecord = result[0];
  const cookiesObj = JSON.parse(browserRecord.cookies);
  console.log('loaded cookies:');
  console.log(cookiesObj);

  // const target = browser.target();
  const target = browser
    .targets()
    .find(targetEnum => targetEnum._targetInfo.type === 'page');

  if (cookiesObj !== null) {
    const cdpSession = await target.createCDPSession();
    await cdpSession.send('Network.setCookies', {
      cookies: cookiesObj
    });
  }

  // Load the pages
  let pageUrls;
  if (browserRecord.pages === null) {
    pageUrls = [];
  } else {
    pageUrls = JSON.parse(browserRecord.pages);
  }

  for (let i = 0; i < pageUrls.length; i++) {
    const pageUrl = pageUrls[i];

    // Chromium starts with an about:blank page open so use that for the first one:
    let page;
    if (i === 0) {
      // eslint-disable-next-line no-await-in-loop
      const pages = await browser.pages();
      page = pages[0];
    } else {
      // eslint-disable-next-line no-await-in-loop
      page = await browser.newPage();
    }
    page.goto(pageUrl);

    // NOTE: the targetcreated event does not seem to be triggered for these
    // pages so we have to instrument the page manually:
    handleNewPage(page);
  }

  console.log(`[BrowserUtils] 1 instrumenting browser...`);
  await instrumentBrowser(browser);

  mainIpc.send('browsersChanged', {});
};

const instrumentBrowser = async browser => {
  console.log(`[BrowserUtils] 2 instrumenting browser...`);

  const pages = await browser.pages();
  const page = pages[0];

  handleNewPage(page);

  // Intercept any new tabs created in the browser:
  browser.on('targetcreated', async target => {
    console.log(`[BrowserUtils] Target created`);
    const newPage = await target.page();
    console.log(`[BrowserUtils] taret page: ${newPage.url()}`);
    handleNewPage(newPage);
  });

  browser.on('disconnected', () => handleBrowserClosed(browser));
};

const handleBrowserClosed = browser => {
  console.log(`handleBrowserClosed for browser #${browser.id}`);

  global.puppeteer_browsers = global.puppeteer_browsers.filter(
    globalBrowser => globalBrowser !== browser
  );
  mainIpc.send('browsersChanged', {});
};

export default {
  openBrowser,
  createBrowser,
  updateBrowser,
  handleBrowserClosed
};
