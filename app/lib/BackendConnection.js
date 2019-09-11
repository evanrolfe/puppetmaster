// import { ipcRenderer } from 'electron';
import ipc from 'node-ipc';
import uuid from 'uuid';

export default class BackendConnection {
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

  async test() {
    const result = await this.send('ring-ring', { message: 'this is james' });
    console.log(`RESULT: ${result}`);

    this.listen('ping', args => {
      console.log(`Received a ping!`);
      console.log(args);
    });
  }

  connectSocket(name, onOpen) {
    this.ipcConnect(name, client => {
      client.on('message', data => {
        const response = JSON.parse(data);

        if (response.type === 'reply' || response.type === 'error') {
          const { id } = response;
          const handler = this.replyHandlers.get(id);
          if (handler) {
            this.replyHandlers.delete(id);

            delete response.id;
            handler.resolve(response);
          }
        } else if (response.type === 'push') {
          const { listenerName, args } = response;

          const listens = this.listeners.get(listenerName);
          if (listens) {
            listens.forEach(listener => {
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
  /*
  get(url, args) {
    this.send('GET', url, args);
  }

  post(url, args) {
    console.log('posting...')
    this.send('POST', url, args);
  }

  delete(url, args) {
    this.send('DELETE', url, args);
  }

  patch(url, args) {
    this.send('PATCH', url, args);
  }
*/

  send(method, url, args) {
    console.log('sending...');
    return new Promise((resolve, reject) => {
      const id = this.uuid.v4();
      this.replyHandlers.set(id, { resolve, reject });
      if (this.socketClient) {
        this.socketClient.emit(
          'message',
          JSON.stringify({ id, method, url, args })
        );
      } else {
        this.messageQueue.push(JSON.stringify({ id, method, url, args }));
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
      this.listeners.set(name, arr.filter(cb_ => cb_ !== cb));
    };
  }

  unlisten(name) {
    this.listeners.set(name, []);
  }
}
