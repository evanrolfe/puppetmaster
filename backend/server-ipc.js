const ipc = require('node-ipc');
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
      console.log(
        `[Backend] Received request for ${request.controller} ${request.action}`
      );

      try {
        const Controller = require(`./controllers/${request.controller}`);
        const controller = new Controller();
        const result = await controller[request.action](request.args);

        ipc.server.emit(
          socket,
          'message',
          JSON.stringify({
            type: 'reply',
            id: request.id,
            sentAt: request.sentAt,
            result
          })
        );
      } catch (error) {
        ipc.server.emit(
          socket,
          'message',
          JSON.stringify({
            type: 'error',
            id: request.id,
            sentAt: request.sentAt,
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
