const Request = require('../models/Request');
const ipc = require('../server-ipc');

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
const instrumentBrowser = async browser => {
  const pages = await browser.pages();
  const page = pages[0];

  handleNewPage(page);

  // Intercept any new tabs created in the browser:
  browser.on('targetcreated', async target => {
    const newPage = await target.page();
    handleNewPage(newPage);
  });
};

const handleFramenavigated = async (page, frame) => {
  console.log(`BrowserUtils: frameNavigated to ${frame.url()}`);
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
    url: page.url(),
    host: parsedUrl.hostname,
    path: parsedUrl.pathname,
    response_body_rendered: pageBody,
    request_type: 'navigation'
  };

  const result = await global.dbStore
    .connection('requests')
    .insert(requestParams);
  console.log(
    `BrowserUtils: create new request ${result[0]} and starting DOMListener...`
  );
  page.requestId = result[0];
  page.domListenerId = await startDOMListener(page);
};

const handleNewPage = async page => {
  page.on('response', async response => handleResponse(page, response));
};

const handleResponse = async (page, response) => {
  const requestId = await Request.createFromBrowserResponse(page, response);

  if (response.request().isNavigationRequest()) {
    console.log(`BrowserUtils: Navigation request for ${page.url()}`);
    page.requestId = requestId;
    const domListenerId = await startDOMListener(page);
    page.domListenerId = domListenerId;
    console.log(
      `BrowserUtils: handleResponse() domListenerId = ${domListenerId}`
    );
    page.on('framenavigated', frame => handleFramenavigated(page, frame));
  }

  ipc.send('requestCreated', {});
};

// eslint-disable-next-line arrow-body-style
const startDOMListener = async page => {
  const domListenerId = await setInterval(async () => {
    console.log(`BrowserUtils: DOMListener ${domListenerId} running...`);

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
    const result = await global.dbStore
      .connection('requests')
      .select('url')
      .where({ id: page.requestId });
    const request = result[0];
    if (request.url !== page.url()) {
      console.log(
        `BrowserUtils: DOMListener ${domListenerId}: ${
          request.url
        } !== ${page.url()}`
      );
      clearInterval(domListenerId); // Stop this listener because it is out of date
      return;
    } else {
      console.log(
        `BrowserUtils: DOMListener ${domListenerId}: ${
          request.url
        } === ${page.url()}`
      );
    }

    // Update the request in the database
    await global.dbStore
      .connection('requests')
      .where({ id: page.requestId })
      .update({ response_body_rendered: body });

    console.log(
      `BrowserUtils: saved content for page: ${page.url()} to request ${
        page.requestId
      }, (DOMListener ${domListenerId})`
    );
  }, 100);
  console.log(`BrowserUtils: started domListener id ${domListenerId}`);
  return domListenerId;
};

module.exports = instrumentBrowser;
