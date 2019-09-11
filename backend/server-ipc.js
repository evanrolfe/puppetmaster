const ipc = require('node-ipc');
const router = require('./lib/router.js');

/*
 * Response (OK): { type: 'reply', id: '1232', result: { status: 'OK', id: '...' } }
 * Response (INVALID): { type: 'reply', id: '1232', result: { status: 'INVALID', messages: [] } }
 * Response (ERROR): { type: 'error', id: '1232', result: 'ERROR: bla bla bla' }
 */
function init(socketName) {
  ipc.config.id = socketName;
  ipc.config.silent = true;

  ipc.serve(() => {
    ipc.server.on('message', (data, socket) => {
      const request = JSON.parse(data);

      try {
        const result = router.getResult(request);

        ipc.server.emit(
          socket,
          'message',
          JSON.stringify({ type: 'reply', id: request.id, result })
        );
      } catch (error) {
        ipc.server.emit(
          socket,
          'message',
          JSON.stringify({ type: 'error', id: request.id, result: error })
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
