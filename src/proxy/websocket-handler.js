import url from 'url';
import WebSocket from 'ws';

const wsServer = new WebSocket.Server({ noServer: true });
wsServer.on('connection', (ws, requestUrl, requestId) => {
  console.log('[WebSocket] Successfully proxying websocket streams');

  pipeWebSocket(ws, ws.upstreamSocket, 'outgoing', requestUrl, requestId);
  pipeWebSocket(ws.upstreamSocket, ws, 'incoming', requestUrl, requestId);
});

const pipeWebSocket = (
  inSocket,
  outSocket,
  direction,
  requestUrl,
  requestId
) => {
  const onPipeFailed = op => err => {
    if (!err) return;

    inSocket.close();
    console.error(`[Proxy] Websocket ${op} failed`, err);
  };

  inSocket.on('message', async body => {
    console.log(
      `[WebSocket] Websocket message ${requestUrl} (${direction}): ${body}`
    );
    const dbParams = {
      request_id: requestId,
      direction: direction,
      body: body,
      created_at: Date.now()
    };
    await global.knex('websocket_messages').insert(dbParams);

    outSocket.send(body, onPipeFailed('message'));
  });

  inSocket.on('close', (num, reason) => {
    if (num >= 1000 && num <= 1004) {
      console.log('[WebSocket] Successfully piping websocket streams');
      outSocket.close(num, reason);
    } else {
      // Unspecified or invalid error
      outSocket.close();
    }
  });

  inSocket.on('ping', data => {
    outSocket.ping(data, undefined, onPipeFailed('ping'));
  });
  inSocket.on('pong', data => {
    outSocket.pong(data, undefined, onPipeFailed('pong'));
  });
};

const saveResponseToDB = async (requestId, response) => {
  const requestParams = {
    response_headers: JSON.stringify(response.headers),
    response_status: response.statusCode,
    response_status_message: response.statusMessage
  };

  await global
    .knex('requests')
    .where({ id: requestId })
    .update(requestParams);
};

const connectUpstream = (requestUrl, request, socket, head, requestId) => {
  console.log(`[WebSocket] Connecting to upstream websocket at ${requestUrl}`);

  const upstreamSocket = new WebSocket(requestUrl);

  // See: https://github.com/websockets/ws/blob/master/doc/ws.md#event-upgrade
  upstreamSocket.once('unexpected-response', async (_request, response) => {
    saveResponseToDB(requestId, response);
  });

  upstreamSocket.once('upgrade', async response => {
    saveResponseToDB(requestId, response);
  });

  upstreamSocket.once('open', () => {
    console.log(`[WebSocket] upstreamSocket for url: ${requestUrl}`);

    wsServer.handleUpgrade(request, socket, head, ws => {
      console.log(`[WebSocket] wsServer.handleUpgrade for url: ${requestUrl}`);
      ws.upstreamSocket = upstreamSocket;
      wsServer.emit('connection', ws, requestUrl, requestId);
    });
  });

  upstreamSocket.once('error', e => console.log(e));
};

const handleUpgrade = async (request, socket, head) => {
  const parsedUrl = url.parse(request.url);
  let { hostname, port } = parsedUrl;
  const { requestedProtocol, path } = parsedUrl;
  console.log(`[WebSocket] handling upgrade for  ${request.url}`);

  const transparentProxy = !hostname;

  if (transparentProxy === true) {
    const hostHeader = request.headers.host;
    [hostname, port] = hostHeader.split(':');

    let protocol;
    if (socket.upstreamEncryption !== undefined) {
      protocol = socket.upstreamEncryption ? 'wss' : 'ws';
    } else {
      protocol = request.connection.encrypted ? 'wss' : 'ws';
    }

    const realUrl = `${protocol}://${hostname}${port ? `:${port}` : ``}${path}`;

    const requestParams = {
      method: request.method,
      url: realUrl,
      host: request.headers.host,
      port: port,
      http_version: request.httpVersion,
      path: path,
      request_type: 'websocket',
      request_headers: JSON.stringify(request.headers)
    };
    const dbResult = await global.knex('requests').insert(requestParams);
    const requestId = dbResult[0];

    connectUpstream(realUrl, request, socket, head, requestId);
  } else {
    // Connect directly according to the specified URL
    const protocol = requestedProtocol.replace('http', 'ws');
    connectUpstream(
      `${protocol}//${hostname}${port ? `:${port}` : ''}${path}`,
      request,
      socket,
      head
    );
  }
};

export default handleUpgrade;