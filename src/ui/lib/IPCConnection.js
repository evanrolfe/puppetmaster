// import { ipcRenderer } from 'electron';
import ipc from 'node-ipc';
import uuid from 'uuid';

/*
const getTime = () => {
  const date = new Date();
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const n = date.getMilliseconds();

  return `${h}:${m}:${s}:${n}`;
};
*/

export default class IPCConnection {
  constructor(socketId) {
    this.replyHandlers = new Map();
    this.listeners = new Map();
    this.messageQueue = [];
    this.socketClient = null;
    this.socketId = socketId;
  }

  // Init
  async init() {
    this.ipcConnect = (id, func) => {
      ipc.config.silent = true;
      ipc.connectTo(id, () => {
        func(ipc.of[id]);
      });
    };

    this.uuid = uuid;

    this.connectSocket(this.socketId, () => {
      console.log('Connected!');
    });
  }

  connectSocket(name, onOpen) {
    this.ipcConnect(name, client => {
      client.on('message', data => {
        const response = JSON.parse(data);
        if (response.type === 'reply' || response.type === 'error') {
          const diffTime = Date.now() - parseInt(response.sentAt);
          console.log(
            `[Frontend] received response from backend in ${diffTime}ms`
          );
          const { id } = response;
          const handler = this.replyHandlers.get(id);
          if (handler) {
            this.replyHandlers.delete(id);

            delete response.id;
            handler.resolve(response);
          }
        } else if (response.type === 'push') {
          const args = response.args;
          const listenerName = response.name;

          const listeners = this.listeners.get(listenerName);
          if (listeners) {
            listeners.forEach(listener => {
              listener(args);
            });
          }
        } else {
          throw new Error(`Unknown message type: ${JSON.stringify(response)}`);
        }
      });

      client.on('connect', () => {
        this.socketClient = client;

        // Send any messages that were queued while closed
        if (this.messageQueue.length > 0) {
          this.messageQueue.forEach(msg => client.emit('message', msg));
          this.messageQueue = [];
        }

        onOpen();
      });

      client.on('disconnect', () => {
        this.socketClient = null;
      });
    });
  }

  disconnect() {
    ipc.disconnect(this.socketId);
  }

  send(controller, action, args) {
    console.log(`[Frontend] request to backend ${controller}.${action}`);

    return new Promise((resolve, reject) => {
      const id = this.uuid.v4();
      const sentAt = Date.now();
      this.replyHandlers.set(id, { resolve, reject });
      if (this.socketClient) {
        this.socketClient.emit(
          'message',
          JSON.stringify({ id, sentAt, controller, action, args })
        );
      } else {
        this.messageQueue.push(
          JSON.stringify({ id, sentAt, controller, action, args })
        );
      }
    });
  }

  listen(name, cb) {
    if (!this.listeners.get(name)) {
      this.listeners.set(name, []);
    }
    this.listeners.get(name).push(cb);

    return () => {
      const arr = this.listeners.get(name);
      this.listeners.set(
        name,
        arr.filter(cb_ => cb_ !== cb)
      );
    };
  }

  unlisten(name) {
    this.listeners.set(name, []);
  }
}
