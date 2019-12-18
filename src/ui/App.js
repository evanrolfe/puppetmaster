// @flow
import { ipcRenderer } from 'electron';
import React, { Component } from 'react';

import { showModal } from './components/modals/index';
import SettingsModal from './components/modals/SettingsModal';
import ThemedApp from './components/ThemedApp';
import ThemeSetter from './components/ThemeSetter';
import BackendConnection from './lib/BackendConnection';
import { Provider } from './state/state';

import { MAIN_SOCKET_NAMES } from '../shared/constants';

export default class App extends Component {
  constructor(props) {
    super(props);

    const socketName = MAIN_SOCKET_NAMES[process.env.NODE_ENV];
    const backendConn = new BackendConnection(socketName);
    const backendConnected = backendConn.init();
    global.backendConn = backendConn;

    ipcRenderer.on('toggle-preferences', () => {
      showModal(SettingsModal);
    });

    ipcRenderer.on('open-project', (e, args) => {
      global.backendConn.send('ProjectsController', 'open', {
        filePath: args.filePath
      });
    });

    // Ensure that the app gets re-rendered once we connect to the backend
    // eslint-disable-next-line react/no-unused-state
    this.state = { backendConnected: backendConnected };
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
