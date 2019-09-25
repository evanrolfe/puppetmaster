const ipc = require('node-ipc');
const router = require('./lib/router.js');
const { setupDatabaseStore } = require('./lib/database.js');

/*
 * Response (OK): { type: 'reply', id: '1232', result: { status: 'OK', id: '...' } }
 * Response (INVALID): { type: 'reply', id: '1232', result: { status: 'INVALID', messages: [] } }
 * Response (ERROR): { type: 'error', id: '1232', result: 'ERROR: bla bla bla' }
 */
async function init(socketName, databaseFile) {
  global.dbStore = await setupDatabaseStore(databaseFile);

  ipc.config.id = socketName;
  ipc.config.silent = true;

  ipc.serve(() => {
    ipc.server.on('message', async (data, socket) => {
      const request = JSON.parse(data);
      console.log(`Received request for ${request.method} ${request.url}`);
      try {
        const result = await router.getResult(request);

        ipc.server.emit(
          socket,
          'message',
          JSON.stringify({ type: 'reply', id: request.id, result })
        );
      } catch (error) {
        ipc.server.emit(
          socket,
          'message',
          JSON.stringify({
            type: 'error',
            id: request.id,
            result: error.message
          })
        );
      }
    });
  });

  ipc.server.start();
}

function send(name, args) {
  ipc.server.broadcast('message', JSON.stringify({ type: 'push', name, args }));
}

module.exports = { init, send };
