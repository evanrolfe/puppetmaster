// eslint-disable-next-line no-unused-vars
import http from 'http';
// eslint-disable-next-line no-unused-vars
import https from 'https';
import url from 'url';

import CaptureFilters from './capture-filters';

const parseHost = (hostString, defaultPort) => {
  const m = hostString.match(/^http:\/\/(.*)/);
  if (m) {
    const parsedUrl = url.parse(hostString);
    return {
      host: parsedUrl.hostname,
      port: parsedUrl.port
    };
  }

  const hostPort = hostString.split(':');
  const host = hostPort[0];
  const port = hostPort.length === 2 ? +hostPort[1] : defaultPort;

  return {
    host: host,
    port: port
  };
};

const parseHostAndPort = (request, defaultPort) => {
  // eslint-disable-next-line no-useless-escape
  const m = request.url.match(/^http:\/\/([^\/]+)(.*)/);
  if (m) {
    request.url = m[2] || '/';
    return parseHost(m[1], defaultPort);
  } else if (request.headers.host) {
    return parseHost(request.headers.host, defaultPort);
  } else {
    return null;
  }
};

export default class Request {
  constructor(params) {
    const attrs = [
      'id',
      'browser_id',
      'method',
      'url',
      'host',
      'port',
      'path',
      'ext',
      'created_at',
      'request_type',
      'request_headers',
      'request_payload',
      'response_status',
      'response_status_message',
      'response_headers',
      'response_remote_address',
      'response_body',
      'response_body_length',
      'response_body_rendered'
    ];
    attrs.forEach(attr => {
      this[attr] = params[attr];
    });
  }

  async saveToDatabase() {
    const requestParams = Object.assign({}, this);
    requestParams.request_headers = JSON.stringify(
      requestParams.request_headers
    );

    if (requestParams.request_payload !== undefined)
      requestParams.request_payload = requestParams.request_payload.toString();

    // Create the request:
    if (this.id === undefined) {
      const shouldRequestBeCaptured = await CaptureFilters.shouldRequestBeCaptured(
        this
      );

      if (shouldRequestBeCaptured === false) return;

      const dbResult = await global.knex('requests').insert(requestParams);
      this.id = dbResult[0];

      // Update the request:
    } else {
      await global
        .knex('requests')
        .where({ id: this.id })
        .update(requestParams);
      console.log(`Saved response to db request: ${this.id}`);
    }
  }

  toHttpRequestOptions() {
    return {
      method: this.method,
      path: this.path,
      host: this.host,
      headers: this.request_headers
    };
  }

  addHttpServerResponse(httpServerResponse) {
    this.response_status = httpServerResponse.statusCode;
    this.response_status_message = httpServerResponse.statusMessage;
    this.response_headers = JSON.stringify(httpServerResponse.headers);
    this.response_body = httpServerResponse.body.toString();
    this.response_remote_address = httpServerResponse.remoteAddress;
  }

  setRequestPayload(requestPayload) {
    // NOTE: This is of type Buffer
    this.request_payload = requestPayload;
  }

  static fromHttpIncomingMessage(incomingMessage) {
    const isSSL = incomingMessage.socket.encrypted;
    const hostPort = parseHostAndPort(incomingMessage, isSSL ? 443 : 80);

    // If the request cannot be parsed:
    if (hostPort === null) return null;

    const protocol = isSSL ? 'https' : 'http';

    // NOTE: clientToProxyRequest.path is undefined
    // NOTE: clientToProxyRequest.url = path in HTTP, but not in HTTPS
    const path = url.parse(incomingMessage.url).path;
    const requestUrl = new URL(path, `${protocol}://${hostPort.host}`);

    // Parse the extension:
    const splitPath = path.split('.');
    let ext;
    if (splitPath.length > 1) ext = splitPath[splitPath.length - 1];

    // Don't forward proxy- headers
    const headers = {};
    for (const h in incomingMessage.headers) {
      // eslint-disable-next-line no-useless-escape
      if (!/^proxy\-/i.test(h)) headers[h] = incomingMessage.headers[h];
    }

    const request = new Request({
      method: incomingMessage.method,
      url: requestUrl.toString(),
      path: path,
      host: hostPort.host,
      port: hostPort.port,
      ext: ext,
      request_headers: headers
    });

    return request;
  }
}
