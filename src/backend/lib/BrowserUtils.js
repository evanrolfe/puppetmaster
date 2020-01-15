// import { curly } from 'node-libcurl';
import puppeteer from 'puppeteer';

import Request from '../models/Request';
import Settings from '../models/Settings';
import mainIpc from '../../shared/ipc-server';

/*
 * NOTE: For each response intercepted, we save the response and its body to requests table.
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
    .insert({ open: 1, created_at: Date.now() });

  const browserId = result[0];

  await global
    .knex('browsers')
    .where({ id: browserId })
    .update({ title: `Session #${browserId}` });

  return browserId;
};

const createBrowser = async () => {
  const browserId = await createBrowserDb();

  const puppeteerExec = puppeteer
    .executablePath()
    .replace('app.asar', 'app.asar.unpacked');

  /*
--ignore-certificate-errors-spki-list=mmf5M/0j6x5DXLVan52Clgxon6Omth3DQ8aadSOTq8M=
--user-data-dir=/home/evan/.config/httptoolkit/chrome-78.0.3904.108
  */

  // https://peter.sh/experiments/chromium-command-line-switches/
  const browserArgs = [
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-site-isolation-trials',
    '--proxy-server=127.0.0.1:8080',
    '--proxy-bypass-list=<-loopback>', // Allows you to access localhost
    '--disable-restore-session-state',
    '--no-default-browser-check',
    '--disable-sync'
  ];

  if (process.env.NODE_ENV === 'test') {
    browserArgs.push('--remote-debugging-port=9222');
  }

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: puppeteerExec,
    userDataDir: `./tmp/browser${browserId}`,
    args: browserArgs
  });

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
  const puppeteerExec = puppeteer
    .executablePath()
    .replace('app.asar', 'app.asar.unpacked');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: puppeteerExec,
    userDataDir: `./tmp/browser${browserId}`,
    args: []
  });

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

  const cdpSession = await target.createCDPSession();
  await cdpSession.send('Network.setCookies', {
    cookies: cookiesObj
  });

  // Load the pages
  const pageUrls = JSON.parse(browserRecord.pages);
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

  // TODO;
  await instrumentBrowser(browser);

  mainIpc.send('browsersChanged', {});
};

const instrumentBrowser = async browser => {
  // TODO: Add this back in but without saving the requests to the db:
  /*
  const pages = await browser.pages();
  const page = pages[0];

  handleNewPage(page);

  // Intercept any new tabs created in the browser:
  browser.on('targetcreated', async target => {
    const newPage = await target.page();
    handleNewPage(newPage);
  });
  */
  browser.on('disconnected', () => handleBrowserClosed(browser));
};

const handleBrowserClosed = async browser => {
  console.log(`handleBrowserClosed for browser #${browser.id}`);

  await global
    .knex('browsers')
    .where({ id: browser.id })
    .update({ open: 0 });

  global.puppeteer_browsers = global.puppeteer_browsers.filter(
    globalBrowser => globalBrowser !== browser
  );
  mainIpc.send('browsersChanged', {});
};

const handleNewPage = async page => {
  if (page === null) return;

  await page.setCacheEnabled(false);
  await page.setRequestInterception(true);
  page.on('request', async request => {
    await handleRequest(page, request);
  });
  page.on('response', async response => handleResponse(page, response));
};

const handleRequest = async (page, request) => {
  const dbRequest = await Request.createFromBrowserRequest(page, request);

  if (dbRequest === undefined) {
    return request.continue();
  }

  request.requestId = dbRequest.id;

  console.log(
    `[BrowserUtils] 1. request intercepted: ${dbRequest.method} ${dbRequest.url}`
  );

  // Check if the intercept is enabled:
  const setting = await Settings.getSetting('interceptEnabled');

  // If its not enabled then we forward every request:
  if (setting.value === '0') {
    request.continue();
    return;
  }

  global.interceptServer.queueRequest(dbRequest);
  const result = await global.interceptServer.decisionFromClient(dbRequest);

  console.log(`[BrowserUtils] received decision from client: ${result.action}`);

  if (result.action === 'forward') {
    request.continue();
    /*
    // result.request === undefined if you press the "Disable Intercept" button
    // when there is still a queue of requests to get through
    const headersObj =
      result.request === undefined
        ? request.headers()
        : result.request.request_headers;
    const headersArr = [];
    Object.keys(headersObj).forEach(key => {
      headersArr.push(`${key}: ${headersObj[key]}`);
    });

    const options = {
      customRequest: request.method().toUpperCase(),
      HTTPHEADER: headersArr
    };

    if (result.request.request_payload !== undefined) {
      console.log(`[BrowserUtils] setting POST body`);
      console.log(result.request.request_payload);

      options.POSTFIELDS = result.request.request_payload;
    }

    // const response = await curly(request.url(), options);

    // TODO: How to handle multiple set-cookies?
    if (response.headers[0]['Set-Cookie'] !== undefined) {
      response.headers[0]['Set-Cookie'] = response.headers[0][
        'Set-Cookie'
      ].toString();
    }

    request.respond({
      status: response.statusCode,
      headers: { 'set-cookie': 'a=b; path=/; HttpOnly' },
      body: response.data
    });
*/
  } else if (result.action === 'drop') {
    request.abort();
  }
};

const handleResponse = async (page, response) => {
  const requestId = response.request().requestId;
  console.log(`handleResponse: requestId: ${requestId}`);
  await Request.updateFromBrowserResponse(page, response);

  // Save the cookies & pages:
  const { cookies } = await page._client.send('Network.getAllCookies');
  const pages = await page.browser().pages();
  const pageUrls = pages.map(pageEnum => pageEnum.url());
  await global
    .knex('browsers')
    .where({ id: page.browser().id })
    .update({
      cookies: JSON.stringify(cookies),
      pages: JSON.stringify(pageUrls)
    });

  if (
    response.request().isNavigationRequest() &&
    page.url() !== 'about:blank'
  ) {
    // Prevent navigation requests from iframes
    // if(response.request().frame() !== null && response.request().frame().url() !== page.url()) return;

    console.log(
      `BrowserUtils: Navigation request for ${page.url()}, requestID: ${requestId}`
    );

    await global
      .knex('browsers')
      .where({ id: page.browser().id })
      .update({ pages: JSON.stringify(pageUrls) });

    if (response.request().frame() !== null) {
      console.log(
        `BrowserUtils: request frame: ${response
          .request()
          .frame()
          .url()}`
      );
    } else {
      console.log(`BrowserUtils: request frame: null`);
    }

    page.requestId = requestId;

    const domListenerId = await startDOMListener(page);
    page.domListenerId = domListenerId;
    console.log(
      `BrowserUtils: handleResponse() domListenerId = ${domListenerId}`
    );

    const origURL = ` ${page.url()}`.slice(1); // Clone the url string
    if (page.listenerCount('framenavigated') === 0) {
      page.on('framenavigated', frame =>
        handleFramenavigated(page, frame, origURL)
      );
    }
  }

  mainIpc.send('requestCreated', {});
};

const handleFramenavigated = async (page, frame, origURL) => {
  // See: https://stackoverflow.com/questions/49237774/using-devtools-protocol-event-page-framenavigated-to-get-client-side-navigation
  // See: https://github.com/GoogleChrome/puppeteer/issues/1489
  if (frame !== page.mainFrame()) return;

  // a framenavigated event gets triggered even if we have already intercepted the requests,
  // so we don't want to create a new request for these ones
  if (frame.url() === origURL) return;

  console.log(
    `BrowserUtils: frameNavigated to ${frame.url()}, origURL: ${origURL}`
  );

  await clearInterval(page.domListenerId);
  console.log(`BrowserUtils: killed DomListener #${page.domListenerId}`);

  let pageBody;
  try {
    pageBody = await page.content();
  } catch (error) {
    // This happens as the result of "navigation request" i.e. typing a url in browser
    // See: https://github.com/GoogleChrome/puppeteer/issues/2258
    console.log(`BrowserUtils: ERRROR Saving the body for frame ${page.url()}`);
  }

  const parsedUrl = new URL(page.url());

  const requestParams = {
    browser_id: page.browser().id,
    url: page.url(),
    host: parsedUrl.hostname,
    path: parsedUrl.pathname,
    response_body_rendered: pageBody,
    request_type: 'navigation',
    created_at: Date.now()
  };

  const result = await global.knex('requests').insert(requestParams);
  //  console.log(
  //    `BrowserUtils: create new request ${result[0]} and starting DOMListener...`
  //  );
  page.requestId = result[0];
  page.domListenerId = await startDOMListener(page);
};

// eslint-disable-next-line arrow-body-style
const startDOMListener = async page => {
  const domListenerId = await setInterval(async () => {
    // console.log(`BrowserUtils: DOMListener ${domListenerId} running...`);

    // Fetch the page's current content
    let body;
    try {
      body = await page.content();
    } catch (e) {
      clearInterval(domListenerId); // This will run if you close the browser.
      return;
    }

    // UGLY WORKAROUND: Prevent the race condition described at the top of page:
    // Check that the page url has not changed while this callback has been running
    const result = await global
      .knex('requests')
      .select('url')
      .where({ id: page.requestId });
    const request = result[0];
    if (request.url !== page.url()) {
      clearInterval(domListenerId); // Stop this listener because it is out of date
      return;
    }

    // Update the request in the database
    await global
      .knex('requests')
      .where({ id: page.requestId })
      .update({ response_body_rendered: body });

    //    console.log(
    //      `BrowserUtils: saved content for page: ${page.url()} to request ${
    //        page.requestId
    //      }, (DOMListener ${domListenerId})`
    //    );
  }, 200);

  return domListenerId;
};

export default {
  openBrowser,
  createBrowser,
  updateBrowser,
  handleBrowserClosed
};
