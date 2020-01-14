import Proxy from 'http-mitm-proxy';

import database from '../shared/database';
import { DATABASE_FILES } from '../shared/constants';

const startProxy = async () => {
  if (process.env.NODE_ENV === undefined) {
    throw new Error(
      `You must set the NODE_ENV var!\ni.e. NODE_ENV=development yarn start-proxy`
    );
  }

  const port = 8080;
  const proxy = Proxy();

  const dbFile = DATABASE_FILES[process.env.NODE_ENV];
  const knex = await database.setupDatabaseStore(dbFile);
  console.log(`[Proxy] Database loaded`);

  proxy.use(Proxy.gunzip);

  proxy.onError((ctx, err, errorKind) => {
    const url =
      ctx && ctx.clientToProxyRequest ? ctx.clientToProxyRequest.url : '';
    console.log(`Error: (${errorKind}) on ${url}`);
    console.log(err);
  });

  proxy.onRequest((ctx, onRequestCallback) => {
    const url = `http://${ctx.clientToProxyRequest.headers.host}${
      ctx.clientToProxyRequest.url
    }`;
    console.log(`REQUEST: ${url}`);
    const chunks = [];

    ctx.onResponseData((_ctx, chunk, callback) => {
      chunks.push(chunk);
      return callback(null, null); // don't write chunks to client response
    });

    ctx.onResponseEnd(async (_ctx, callback) => {
      const body = Buffer.concat(chunks);
      // console.log(body.toString()+"\n\n\n")

      await knex('requests').insert({
        url: url,
        host: ctx.clientToProxyRequest.headers.host,
        path: ctx.clientToProxyRequest.url,
        method: ctx.clientToProxyRequest.method,
        response_status: ctx.proxyToClientResponse.statusCode,
        response_status_message: ctx.proxyToClientResponse.statusMessage
      });

      ctx.proxyToClientResponse.write(body);
      return callback();
    });

    onRequestCallback();
  });

  proxy.listen({ port: port, sslCaDir: '/home/evan/Code/proxy' });
  console.log(`Proxy server listening on port ${port}`);
};

startProxy();
