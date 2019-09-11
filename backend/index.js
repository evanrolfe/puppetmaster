const ipc = require('./server-ipc');

let isDev;
let version;

if (process.argv[2] === '--subprocess') {
  isDev = false;
  version = process.argv[3];

  const socketName = process.argv[4];
  ipc.init(socketName);
} else {
  // eslint-disable-next-line global-require
  const { ipcRenderer, remote } = require('electron');
  isDev = true;
  version = remote.app.getVersion();

  ipcRenderer.on('set-socket', (event, { name }) => {
    ipc.init(name);
  });
}
/*
setInterval(() => {
  ipc.send('ping', {hello: 'world'});
}, 1000);
*/
console.log(version, isDev);
