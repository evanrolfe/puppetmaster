const { ipcRenderer } = require('electron');
const ipc = require('node-ipc');
const uuid = require('uuid');

export default class BackendConnection {
  constructor() {
    this.replyHandlers = new Map();
    this.listeners = new Map();
    this.messageQueue = [];
    this.socketClient = null;
  }

  // Init
  async init() {
    let resolveSocketPromise;
    const socketPromise = new Promise(resolve => {
      resolveSocketPromise = resolve;
    });

    window.getServerSocket = () => socketPromise;

    ipcRenderer.on('set-socket', (event, { name }) => {
      resolveSocketPromise(name);
    });

    window.ipcConnect = (id, func) => {
      ipc.config.silent = true;
      ipc.connectTo(id, () => {
        func(ipc.of[id]);
      });
    };

    window.uuid = uuid;

    const socketName = await window.getServerSocket();
    this.connectSocket(socketName, () => {
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
    window.ipcConnect(name, client => {
      client.on('message', data => {
        const msg = JSON.parse(data);

        if (msg.type === 'error') {
          // Up to you whether or not to care about the error
          const { id } = msg;
          this.replyHandlers.delete(id);
        } else if (msg.type === 'reply') {
          const { id, result } = msg;

          const handler = this.replyHandlers.get(id);
          if (handler) {
            this.replyHandlers.delete(id);
            handler.resolve(result);
          }
        } else if (msg.type === 'push') {
          const { listenerName, args } = msg;

          const listens = this.listeners.get(listenerName);
          if (listens) {
            listens.forEach(listener => {
              listener(args);
            });
          }
        } else {
          throw new Error(`Unknown message type: ${JSON.stringify(msg)}`);
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

  send(name, args) {
    return new Promise((resolve, reject) => {
      const id = window.uuid.v4();
      this.replyHandlers.set(id, { resolve, reject });
      if (this.socketClient) {
        this.socketClient.emit('message', JSON.stringify({ id, name, args }));
      } else {
        this.messageQueue.push(JSON.stringify({ id, name, args }));
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
