// eslint-disable-next-line no-unused-vars
import http from 'http';
// eslint-disable-next-line no-unused-vars
import https from 'https';
import zlib from 'zlib';

import proxyIPC from '../shared/ipc-server';
import Request from '../shared/models/request';

const INTERCEPT_ENABLED = false;
/*
const generateRawRequest = (request) => {
  let str = `${request.method.toUpperCase()} ${request.url} HTTP/${request.httpVersion}\n`
  for (let i=0; i<request.rawHeaders.length; i+=2) {
      str += `${request.rawHeaders[i]}: ${request.rawHeaders[i + 1]}\n`
  }

  return str;
};
*/
const makeProxyToServerRequest = parsedRequest =>
  new Promise(resolve => {
    const protocol = parsedRequest.port === 443 ? https : http;
    console.log(parsedRequest.toHttpRequestOptions());
    const proxyToServerRequest = protocol.request(
      parsedRequest.toHttpRequestOptions(),
      response => {
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
      }
    );

    if (
      parsedRequest.request_payload !== undefined &&
      parsedRequest.request_payload.length > 0
    ) {
      proxyToServerRequest.write(parsedRequest.request_payload);
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
      console.log('Request Data: ', data.toString());
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

    if (INTERCEPT_ENABLED) {
      // const requestForIntercept = Object.assign({}, requestOptions);
      // requestForIntercept.id = dbRequestId;
      // requestForIntercept.raw = generateRawRequest(clientToProxyRequest);
      // console.log(requestForIntercept.raw)
      // global.interceptServer.queueRequest(requestForIntercept);
      // await global.interceptServer.decisionFromClient(requestForIntercept);
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
