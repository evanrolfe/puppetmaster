const Request = require('../models/Request');
const ipc = require('../server-ipc');

/*
 * NOTE: For each response intercepted, we save the response and its body to requests table.
 * If that request is a navigation request (i.e. a page displayed in the browser), then we start
 * the DOMListener, which saves the page's rendered DOM to request.response_body_rendered every
 * 100ms.
 *
 * For every page, we also listen for the framenavigated event, which creates a navigation request
 * and saves the rendered DOM to that request in the database.
 */
const handleFramenavigated = async (page, frame) => {
  console.log(`BrowserUtils: frameNavigated: ${frame.url()}`);

  let body;
  try {
    body = await page.content();
  } catch (error) {
    // This happens as the result of "navigation request" i.e. typing a url in browser
    // See: https://github.com/GoogleChrome/puppeteer/issues/2258
    console.log(`ERRROR Saving the body for frame ${page.url()}`);
  }

  const parsedUrl = new URL(page.url());

  const request = Request.new({
    url: page.url(),
    host: parsedUrl.hostname,
    path: parsedUrl.pathname,
    response_body_rendered: body,
    request_type: 'navigation'
  });

  request.save();

  page.request = request;
  // clearInterval(page.domListenerId);
};

const handleNewPage = async page => {
  page.on('response', async response => handleResponse(page, response));
  page.on('framenavigated', async frame => handleFramenavigated(page, frame));
};

const handleResponse = async (page, response) => {
  const request = await Request.createFromBrowserResponse(page, response);
  if (response.request().isNavigationRequest()) {
    page.request = request;
    page.domListenerId = startDOMListener(page);
  }
  ipc.send('requestCreated', {});
};

// eslint-disable-next-line arrow-body-style
const startDOMListener = async page => {
  return setInterval(async () => {
    const body = await page.content();
    page.request.response_body_rendered = body;
    page.request.save();
    console.log(
      `BrowserUtils: saved content for page: ${page.url()} to request ${
        page.request.id
      }`
    );
  }, 100);
};

module.exports = { handleNewPage, handleResponse };
