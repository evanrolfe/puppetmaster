// eslint-disable-next-line no-unused-vars
import http from 'http';
// eslint-disable-next-line no-unused-vars
import https from 'https';
import zlib from 'zlib';

import proxyIPC from '../shared/ipc-server';
import Request from '../shared/models/request';
import Settings from '../shared/models/settings';

const interceptEnabled = async () => {
  const setting = await Settings.getSetting('interceptEnabled');
  return setting.value === '1';
};

const makeProxyToServerRequest = parsedRequest =>
  new Promise(resolve => {
    const protocol = parsedRequest.port === 443 ? https : http;
    const requestOptions = parsedRequest.toHttpRequestOptions();

    const proxyToServerRequest = protocol.request(requestOptions, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));

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

    if (
      requestOptions.payload !== undefined &&
      requestOptions.payload.length > 0
    ) {
      proxyToServerRequest.write(requestOptions.payload);
    }

    proxyToServerRequest.end();
  });

const proxyRequestListener = async (
  clientToProxyRequest,
  proxyToClientResponse
) => {
  const chunks = [];
  clientToProxyRequest.on('data', chunk => chunks.push(chunk));

  const requestPayload = await new Promise(resolve => {
    clientToProxyRequest.on('end', () => {
      const data = Buffer.concat(chunks);
      resolve(data);
    });
  });

  const parsedRequest = Request.fromHttpIncomingMessage(clientToProxyRequest);

  if (requestPayload.length > 0)
    parsedRequest.setRequestPayload(requestPayload);

  if (parsedRequest === null) {
    clientToProxyRequest.resume();
    proxyToClientResponse.writeHeader(400, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    proxyToClientResponse.end('Bad request: Host missing...', 'UTF-8');
  } else {
    await parsedRequest.saveToDatabase();
    proxyIPC.send('requestCreated', {});

    const isInterceptEnabled = await interceptEnabled();

    if (isInterceptEnabled && parsedRequest.id !== undefined) {
      const requestForIntercept = parsedRequest.toInterceptParams();

      global.interceptServer.queueRequest(requestForIntercept);
      const result = await global.interceptServer.decisionFromClient(
        requestForIntercept
      );

      // If you press "disable intercept", then there will be no result.request
      if (result.request !== undefined) {
        parsedRequest.setRawRequest(result.request.rawRequest);
      }
    }

    const serverToProxyResponse = await makeProxyToServerRequest(parsedRequest);

    if (parsedRequest.id !== undefined) {
      parsedRequest.addHttpServerResponse(serverToProxyResponse);
      await parsedRequest.saveToDatabase();
      proxyIPC.send('requestCreated', {});
    }

    const responseHeaders = Object.assign(serverToProxyResponse.headers);
    responseHeaders['content-length'] = Buffer.byteLength(
      serverToProxyResponse.body
    );

    proxyToClientResponse.writeHead(
      serverToProxyResponse.statusCode,
      responseHeaders
    );

    proxyToClientResponse.end(serverToProxyResponse.body);
  }
};

export default proxyRequestListener;
