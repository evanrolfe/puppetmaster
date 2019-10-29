const Request = require('../models/Request');
const ipc = require('../server-ipc');

/*
 * NOTE: For each page created,
 *
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
    response_body: body,
    response_body_length: body.length
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
  }, 1000);
};

module.exports = { handleNewPage, handleResponse };
