import http from 'http';
import https from 'https';
import zlib from 'zlib';
import url from 'url';

import ipc from '../shared/ipc-server';
import CaptureFilters from '../shared/models/CaptureFilters';

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

const saveRequestToDatabase = async requestOptions => {
  const protocol = requestOptions.port === 443 ? 'https' : 'http';
  const requestUrl = new URL(
    requestOptions.path,
    `${protocol}://${requestOptions.host}`
  );

  // Parse the URL:
  const splitPath = requestOptions.path.split('.');
  let ext;
  if (splitPath.length > 1) ext = splitPath[splitPath.length - 1];

  const requestParams = {
    url: requestUrl.toString(),
    host: requestOptions.host,
    path: requestOptions.path,
    method: requestOptions.method,
    ext: ext,
    created_at: Date.now(),
    request_headers: JSON.stringify(requestOptions.headers)
  };

  const shouldRequestBeCaptured = await CaptureFilters.shouldRequestBeCaptured(
    requestParams
  );

  if (shouldRequestBeCaptured === false) return;

  const dbResult = await global.knex('requests').insert(requestParams);
  ipc.send('requestCreated', {});

  const dbRequestId = dbResult[0];
  return dbRequestId;
};

const saveResponeToDatabase = async (response, dbRequestId) => {
  await global
    .knex('requests')
    .where({ id: dbRequestId })
    .update({
      response_status: response.statusCode,
      response_status_message: response.statusMessage,
      response_headers: JSON.stringify(response.headers),
      response_body: response.body.toString(),
      response_remote_address: response.remoteAddress
    });
  ipc.send('requestCreated', {});
  console.log(`Saved response to db request: ${dbRequestId}`);
};

const makeProxyToServerRequest = requestOptions =>
  new Promise(resolve => {
    console.log('Making request to...');
    console.log(requestOptions);
    const protocol = requestOptions.port === 443 ? https : http;

    const proxyToServerRequest = protocol.request(requestOptions, response => {
      console.log(`STATUS: ${response.statusCode}`);

      const chunks = [];

      response.on('data', chunk => {
        chunks.push(chunk);
      });

      response.on('end', () => {
        const bodyRaw = Buffer.concat(chunks);
        let body;
        const contentEncoding = response.headers['content-encoding'];

        if (contentEncoding && contentEncoding.toLowerCase() === 'gzip') {
          delete response.headers['content-encoding'];
          body = zlib.gunzipSync(bodyRaw);
        } else {
          body = bodyRaw;
        }

        const remoteAddress = `${response.socket.remoteAddress}:${response.socket.remotePort}`;

        resolve({
          body: body,
          headers: response.headers,
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          remoteAddress: remoteAddress
        });
      });
    });

    proxyToServerRequest.end();
  });

const proxyRequestListener = async (
  clientToProxyRequest,
  proxyToClientResponse
) => {
  const isSSL = clientToProxyRequest.socket.encrypted;

  if (isSSL === true) {
    console.log(`SSL Request to: ${clientToProxyRequest.url}`);
  } else {
    console.log(`Request to: ${clientToProxyRequest.url}`);
  }

  const hostPort = parseHostAndPort(clientToProxyRequest, isSSL ? 443 : 80);

  // NOTE: clientToProxyRequest.path is undefined
  // NOTE: clientToProxyRequest.url = path in HTTP, but not in HTTPS
  const path = url.parse(clientToProxyRequest.url).path;

  if (hostPort === null) {
    clientToProxyRequest.resume();
    proxyToClientResponse.writeHeader(400, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    proxyToClientResponse.end('Bad request: Host missing...', 'UTF-8');
  } else {
    const headers = {};
    for (const h in clientToProxyRequest.headers) {
      // don't forward proxy- headers
      // eslint-disable-next-line no-useless-escape
      if (!/^proxy\-/i.test(h)) {
        headers[h] = clientToProxyRequest.headers[h];
      }
    }

    const requestOptions = {
      method: clientToProxyRequest.method,
      path: path,
      host: hostPort.host,
      port: hostPort.port,
      headers: headers
    };

    const dbRequestId = await saveRequestToDatabase(requestOptions);
    const serverToProxyResponse = await makeProxyToServerRequest(
      requestOptions
    );

    if (dbRequestId !== undefined) {
      saveResponeToDatabase(serverToProxyResponse, dbRequestId);
    }

    const responseHeaders = Object.assign(serverToProxyResponse.headers);
    responseHeaders['content-length'] = Buffer.byteLength(
      serverToProxyResponse.body
    );
    console.log(responseHeaders);
    proxyToClientResponse.writeHead(
      serverToProxyResponse.statusCode,
      responseHeaders
    );
    proxyToClientResponse.end(serverToProxyResponse.body);
  }
};

export default proxyRequestListener;
