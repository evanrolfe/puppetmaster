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
      'http_version',
      'path',
      'ext',
      'request_headers',
      'request_payload',

      'request_modified',
      'modified_method',
      'modified_url',
      'modified_host',
      'modified_port',
      'modified_http_version',
      'modified_path',
      'modified_ext',
      'modified_request_headers',
      'modified_request_payload',

      'created_at',
      'request_type',
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
    requestParams.modified_request_headers = JSON.stringify(
      requestParams.modified_request_headers
    );

    if (requestParams.request_payload !== undefined)
      requestParams.request_payload = requestParams.request_payload.toString();

    if (requestParams.modified_request_payload !== undefined)
      requestParams.modified_request_payload = requestParams.modified_request_payload.toString();

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
    const method =
      this.modified_method === undefined ? this.method : this.modified_method;
    const path =
      this.modified_path === undefined ? this.path : this.modified_path;
    const host =
      this.modified_host === undefined ? this.host : this.modified_host;
    const headers =
      this.modified_request_headers === undefined
        ? this.request_headers
        : this.modified_request_headers;
    const payload =
      this.modified_request_payload === undefined
        ? this.request_payload
        : this.modified_request_payload;

    return {
      method: method,
      path: path,
      host: host,
      headers: headers,
      payload: payload
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

  toInterceptParams() {
    let rawRequest = `${this.method.toUpperCase()} ${this.path} HTTP/${
      this.http_version
    }\n`;
    Object.keys(this.request_headers).forEach(header => {
      rawRequest += `${header}: ${this.request_headers[header]}\n`;
    });

    if (this.request_payload !== undefined && this.request_payload.length > 0) {
      rawRequest += '\n';
      rawRequest += this.request_payload.toString();
    }

    return {
      id: this.id,
      method: this.method,
      url: this.url,
      rawRequest: rawRequest
    };
  }

  // Overwrites the existing request based on whats contained in the raw request
  setRawRequest(rawRequest) {
    const originalRawRequest = this.toInterceptParams().rawRequest;
    if (originalRawRequest === rawRequest) return;

    this.request_modified = true;

    const lines = rawRequest.split('\n');
    const startLineItems = lines[0].split(' ');
    this.modified_method = startLineItems[0].toUpperCase();
    this.modified_path = startLineItems[1];

    const headerLines = lines.slice(1, lines.length);

    // If there is a payload in the request, do not process it as a header:
    if (headerLines[headerLines.length - 2] === '') {
      const payloadStr = headerLines.pop();
      this.modified_request_payload = Buffer.from(payloadStr);
    }

    const headers = {};
    headerLines.forEach(line => {
      if (line.length === 0) return;

      const splitLine = line.split(': ');
      headers[splitLine[0]] = splitLine[1];
    });

    // If the payload has been modified, set the content-length header:
    if (this.modified_request_payload !== undefined) {
      headers['content-length'] = this.modified_request_payload.length;
    }

    this.modified_host = headers.host;
    this.modified_request_headers = headers;

    // Rebuild the url from the host, path & protocol
    const protocol = this.modified_port === 443 ? 'https' : 'http';
    const requestUrl = new URL(
      this.modified_path,
      `${protocol}://${this.modified_host}`
    );
    this.modified_url = requestUrl.toString();

    // Parse the extension:
    const splitPath = this.modified_path.split('.');
    let ext;
    if (splitPath.length > 1) ext = splitPath[splitPath.length - 1];
    this.modified_ext = ext;
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
      http_version: incomingMessage.httpVersion,
      ext: ext,
      request_headers: headers
    });

    return request;
  }
}
