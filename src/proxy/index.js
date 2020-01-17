import Proxy from 'http-mitm-proxy';

import ipc from '../shared/ipc-server';
import database from '../shared/database';
import { DATABASE_FILES, PROXY_SOCKET_NAMES } from '../shared/constants';
import CaptureFilters from '../shared/models/CaptureFilters';

import certUtils from '../shared/cert-utils';

const startProxy = async () => {
  if (process.env.NODE_ENV === undefined) {
    throw new Error(
      `You must set the NODE_ENV var!\ni.e. NODE_ENV=development yarn start-proxy`
    );
  }

  const port = 8080;
  const proxy = Proxy();

  const dbFile = DATABASE_FILES[process.env.NODE_ENV];
  global.knex = await database.setupDatabaseStore(dbFile);
  console.log(`[Proxy] Database loaded`);

  proxy.use(Proxy.gunzip);

  proxy.onError((ctx, err, errorKind) => {
    const url =
      ctx && ctx.clientToProxyRequest ? ctx.clientToProxyRequest.url : '';
    console.log(`Error: (${errorKind}) on ${url}`);
    console.log(err);
  });

  proxy.onRequest(async (ctx, onRequestCallback) => {
    const request = ctx.clientToProxyRequest;

    // Parse the URL:
    const splitPath = request.url.split('.');
    let ext;

    if (splitPath.length > 1) {
      ext = splitPath[splitPath.length - 1];
    }

    const protocol = request.socket.encrypted === true ? 'https' : 'http';
    const url = new URL(request.url, `${protocol}://${request.headers.host}`);
    console.log(`Request to: ${url.toString()}`);

    // First create the request
    const requestParams = {
      url: url.toString(),
      host: request.headers.host,
      path: request.url,
      method: request.method,
      // TODO:
      browser_id: 1,
      ext: ext,
      created_at: Date.now(),
      request_headers: JSON.stringify(request.headers)
    };
    const shouldRequestBeCaptured = await CaptureFilters.shouldRequestBeCaptured(
      requestParams
    );

    let dbRequestId;
    if (shouldRequestBeCaptured === true) {
      const dbResult = await global.knex('requests').insert(requestParams);
      dbRequestId = dbResult[0];
      ctx.proxyToServerRequestOptions.headers[
        'X-PuppetMaster-Id'
      ] = dbRequestId;
    }

    const chunks = [];

    ctx.onResponseData((_ctx, chunk, callback) => {
      chunks.push(chunk);
      return callback(null, null); // don't write chunks to client response
    });

    ctx.onResponseEnd(async (_ctx, callback) => {
      console.log(`RESPONSE: ${url.toString()}`);

      const body = Buffer.concat(chunks);

      const response = ctx.serverToProxyResponse;

      // Update the request in the database
      if (dbRequestId !== undefined) {
        await global
          .knex('requests')
          .where({ id: dbRequestId })
          .update({
            response_status: response.statusCode,
            response_status_message: response.statusMessage,
            response_headers: JSON.stringify(response.headers),
            response_body: body.toString()
          });

        ipc.send('requestCreated', {});
      }

      // TODO: How did we get the browser to stop caching?
      ctx.proxyToClientResponse.write(body);
      return callback();
    });

    onRequestCallback();
  });

  // To generate your own certs from the command line:
  // 1. Generate testCA.key and testCA.pem:
  //   openssl req -x509 -new -nodes -keyout testCA.key -sha256 -days 365 -out testCA.pem -subj '/CN=Puppet Master Test CA - DO NOT TRUST'
  // 2. Generate the SPKI Fingerprint:
  //   openssl rsa -in testCA.key -outform der -pubout 2>/dev/null | sha256sum | xxd -r -p | base64

  // eslint-disable-next-line func-names
  proxy.onCertificateRequired = function(hostname, callback) {
    return callback(null, certUtils.certPaths);
  };

  proxy.listen({ port: port });
  console.log(`Proxy server listening on port ${port}`);
};

const socketName = PROXY_SOCKET_NAMES[process.env.NODE_ENV];
ipc.init(socketName, {});
startProxy();
