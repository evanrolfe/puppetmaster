import { IPC } from 'node-ipc';

import BrowsersController from './controllers/BrowsersController';
import CaptureFiltersController from './controllers/CaptureFiltersController';
import RequestsController from './controllers/RequestsController';
import SettingsController from './controllers/SettingsController';

const ipc = new IPC();
/*
 * Response (OK): { type: 'reply', id: '1232', result: { status: 'OK', id: '...' } }
 * Response (INVALID): { type: 'reply', id: '1232', result: { status: 'INVALID', messages: [] } }
 * Response (ERROR): { type: 'error', id: '1232', result: 'ERROR: bla bla bla' }
 */
async function init(socketName) {
  ipc.config.id = socketName;
  ipc.config.silent = true;

  ipc.serve(() => {
    ipc.server.on('message', async (data, socket) => {
      const request = JSON.parse(data);
      console.log(
        `[Backend] Received request for ${request.controller} ${request.action}`
      );

      try {
        const controllersMap = {
          BrowsersController: BrowsersController,
          CaptureFiltersController: CaptureFiltersController,
          RequestsController: RequestsController,
          SettingsController: SettingsController
        };

        const controller = new controllersMap[request.controller]();
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
  // HACK: Broadcast is not available in test mode
  if (typeof ipc.server.broadcast === 'function') {
    ipc.server.broadcast(
      'message',
      JSON.stringify({ type: 'push', name, args })
    );
  }
}

export default { init, send };
