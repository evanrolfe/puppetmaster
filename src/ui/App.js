// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import { showModal } from './components/modals/index';
import SettingsModal from './components/modals/SettingsModal';
import ThemedApp from './components/ThemedApp';
import ThemeSetter from './components/ThemeSetter';
import IPCConnection from './lib/IPCConnection';
import { Provider } from './state/state';

import { BACKEND_SOCKET_NAMES, PROXY_SOCKET_NAMES } from '../shared/constants';

export default class App extends Component {
  constructor(props) {
    super(props);

    // Connect to the backend via IPC
    const backendSocketName = BACKEND_SOCKET_NAMES[process.env.NODE_ENV];
    const backendConn = new IPCConnection(backendSocketName);
    const backendConnected = backendConn.init();
    global.backendConn = backendConn;

    // Connect to the proxy via IPC
    const proxySocketName = PROXY_SOCKET_NAMES[process.env.NODE_ENV];
    const proxyConn = new IPCConnection(proxySocketName);
    const proxyConnected = proxyConn.init();
    global.proxyConn = proxyConn;

    ipcRenderer.on('toggle-preferences', () => {
      showModal(SettingsModal);
    });

    ipcRenderer.on('open-project', (e, args) => {
      console.log(args.filePath);
    });

    // Ensure that the app gets re-rendered once we connect to the backend

    this.state = {
      // eslint-disable-next-line react/no-unused-state
      backendConnected: backendConnected,
      // eslint-disable-next-line react/no-unused-state
      proxyConnected: proxyConnected
    };
  }

  render() {
    console.log('[RENDER] App');

    return (
      <Provider>
        <ThemeSetter />
        <ThemedApp />
      </Provider>
    );
  }
}
