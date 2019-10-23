const Store = require('openrecord/store/sqlite3');
const CaptureFilters = require('../models/CaptureFilters');

const RESOURCE_TYPES = [
  'document',
  'eventsource',
  'fetch',
  'font',
  'image',
  'manifest',
  'media',
  'other',
  'stylesheet',
  'script',
  'texttrack',
  'websocket',
  'xhr'
];

const STATUS_CODES = ['2', '3', '4', '5'];

const SEARCHABLE_COLUMNS = ['id', 'method', 'url'];

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

    const request = Request.new({
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

    const shouldRequestBeCaptured = await CaptureFilters.shouldRequestBeCaptured(
      request
    );

    if (shouldRequestBeCaptured === true) {
      await request.save();
    }
  }

  static findByParams(columns, params) {
    let query = global.dbStore.connection('requests').select(columns);

    // Host filter:
    if (['include', 'exclude'].includes(params.hostSetting)) {
      const likeOperator =
        params.hostSetting === 'include' ? 'whereIn' : 'whereNotIn';
      query = query[likeOperator]('host', params.hostList);
    }

    // Path filter:
    if (['include', 'exclude'].includes(params.pathSetting)) {
      if (params.pathSetting === 'include') {
        // eslint-disable-next-line func-names
        query = query.where(function() {
          params.pathList.forEach((path, i) => {
            const whereOperator = i === 0 ? 'where' : 'orWhere';

            this[whereOperator]('path', 'like', `%${path}%`);
          });
        });
      } else {
        // eslint-disable-next-line func-names
        query = query.where(function() {
          params.pathList.forEach(path => {
            this.where('path', 'not like', `%${path}%`);
          });
        });
      }
    }

    // Ext filter:
    if (['include', 'exclude'].includes(params.extSetting)) {
      const operator =
        params.extSetting === 'include' ? 'whereIn' : 'whereNotIn';
      query = query[operator]('ext', params.extList);
    }

    // ResourceType filter:
    if (
      params.resourceTypes !== undefined &&
      params.resourceTypes.length < RESOURCE_TYPES.length
    ) {
      query = query.whereIn('request_type', params.resourceTypes);
    }

    // StatusCode filter:
    if (
      params.statusCodes !== undefined &&
      params.statusCodes.length < STATUS_CODES.length
    ) {
      const questionMarks = Array(params.statusCodes.length)
        .fill()
        .map(() => '?')
        .join(',');

      query = query.whereRaw(
        `SUBSTR(CAST(response_status AS text),0,2) IN (${questionMarks})`,
        params.statusCodes
      );
    }

    // Search filter:
    if (params.search !== undefined) {
      // query = query.where('path', 'like', `%${params.search}%`);
      // eslint-disable-next-line func-names
      query = query.where(function() {
        SEARCHABLE_COLUMNS.forEach(column => {
          this.orWhere(column, 'like', `%${params.search}%`);
        });
      });
    }

    // Order
    if (params.order_by !== undefined && params.dir !== undefined) {
      query = query.orderBy(params.order_by, params.dir);
    } else {
      query = query.orderBy('id', 'desc');
    }

    console.log(`[Backend] SQL Query: ${query.toSQL().sql}`);

    return query;
  }
}

module.exports = Request;
