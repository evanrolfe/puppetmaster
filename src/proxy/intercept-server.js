import { EventEmitter } from 'events';
import { IPC } from 'node-ipc';

// This refers to the proxy IPC socket
import proxyIPC from '../shared/ipc-server';

const interceptIPC = new IPC();

/*
 * InterceptServer: communicates with the BrowserInterceptPage on the frontend.
 * It starts an ipc server on the channel "intercept".
 * When a request is intercepted it first sends a "requestIntercepted" message
 * to the client on the proxy IPC channel. It then waits until the a decision
 * message is received on the intercept channel and it will then either
 * forward the request or drop it depending on the message. If a new request is
 * queued while the first one is still waiting for the message from the client,
 * it will wait until that first request has completed to send a new
 * "requestIntercepted" message to the client. And the process repeats...
 */
export default class InterceptServer {
  constructor(socketName) {
    this.events = new EventEmitter();
    this.requestQueue = [];
    this.awaitingReply = false;
    this.socketName = socketName;

    this.events.on('requestQueued', async request => {
      if (
        this.awaitingReply === false &&
        this.requestQueue.includes(request.id)
      ) {
        this.awaitingReply = true;

        console.log(
          `[InterceptServer] Processing request ${request.id} from queue...`
        );
        proxyIPC.send('requestIntercepted', { request: request });
      } else {
        setTimeout(() => {
          this.events.emit('requestQueued', request);
        }, 100);
      }
    });
  }

  init() {
    interceptIPC.config.id = this.socketName;
    interceptIPC.config.silent = true;

    interceptIPC.serve(() => {
      interceptIPC.server.on('message', data => {
        console.log(
          `[InterceptServer] Received IPC message: ${JSON.stringify(data)}`
        );

        if (data.action === 'forward') {
          this.events.emit(`requestDecision-${data.request.id}`, data);
        } else if (data.action === 'forwardAndIntercept') {
          // TODO
        } else if (data.action === 'disable') {
          console.log(`[InterceptServer] disabling the request queue...`);
          this.clearQueue();
        }
      });
    });
    interceptIPC.server.start();
    console.log(
      '[InterceptServer] Started IPC Intercept server, awaiting message from client...'
    );
  }

  queueRequest(request) {
    this.requestQueue.push(request.id);
    this.events.emit('requestQueued', request);
  }

  clearQueue() {
    // Forward all the requests and clear the queue:
    console.log(
      `[InterceptServer] clearing queue of requests: ${JSON.stringify(
        this.requestQueue
      )}`
    );
    this.requestQueue.forEach(requestId => {
      this.events.emit(`requestDecision-${requestId}`, { action: 'forward' });
    });
  }

  async decisionFromClient(request) {
    console.log(
      `[InterceptServer] requestToComplete ${request.id}, waiting...`
    );

    // NOTE: For some reason once() returns an array of the event arguments
    const data = await new Promise(resolve =>
      this.events.once(`requestDecision-${request.id}`, dataArr =>
        resolve(dataArr)
      )
    );

    this.awaitingReply = false;
    this.requestQueue = this.requestQueue.filter(id => id !== request.id);

    console.log(`[InterceptServer]  request ${request.id} complete`);
    console.log(data);

    return data;
  }
}
