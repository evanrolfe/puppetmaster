const Store = require('openrecord/store/sqlite3');

class Request extends Store.BaseModel {
  static async createFromBrowserResponse(page, response) {
    const remoteAddress = `${response.remoteAddress().ip}:${
      response.remoteAddress().port
    }`;

    let responseBody;
    try {
      responseBody = await response.text();
    } catch (error) {
      // This happens as the result of "navigation request" i.e. typing a url in browser
      // See: https://github.com/GoogleChrome/puppeteer/issues/2258
      console.log(
        `ERRROR Saving the body for request: ${response
          .request()
          .method()} ${response.url()}`
      );
    }

    const cookies = await page.cookies();
    const cookiesStr = cookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
    const responseHeaders = response.request().headers();
    responseHeaders.cookie = cookiesStr;

    console.log(
      `Saving request: ${response.request().method()} ${response.url()}`
    );

    const parsedUrl = new URL(response.url());
    const splitPath = parsedUrl.pathname.split('.');
    let ext;

    if (splitPath.length > 1) {
      ext = splitPath[splitPath.length - 1];
    }

    return Request.create({
      method: response.request().method(),
      url: response.url(),
      host: parsedUrl.hostname,
      path: parsedUrl.pathname,
      ext: ext,
      created_at: Date.now(),
      request_type: response.request().resourceType(),
      request_headers: JSON.stringify(responseHeaders),
      request_payload: JSON.stringify(response.request().postData()),
      response_status: response.status(),
      response_status_message: response.statusText(),
      response_headers: JSON.stringify(response.headers()),
      response_remote_address: remoteAddress,
      response_body: responseBody,
      response_body_length: responseBody.length
    });
  }
}

module.exports = Request;
