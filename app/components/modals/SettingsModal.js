import React, { Component } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Modal from './Modal';
import ModalBody from './ModalBody';
import ModalHeader from './ModalHeader';

import AboutSettingsTab from '../settings/AboutSettingsTab';
import GeneralSettingsTab from '../settings/GeneralSettingsTab';
import ThemeSettingsTab from '../settings/ThemeSettingsTab';
import NetworkSettingsTab from '../settings/NetworkSettingsTab';

import SettingsContext from '../../lib/SettingsContext';

export const TAB_INDEX_EXPORT = 1;
export const TAB_INDEX_SHORTCUTS = 3;

export default class SettingsModal extends Component {
  constructor(props, context) {
    super(props, context);

    this.context = context;

    this.state = { tabIndex: 0 };

    this._setModalRef = this._setModalRef.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  goTo(tabIndex) {
    this.setState({ tabIndex: tabIndex });
  }

  _setModalRef(n) {
    this.modal = n;
  }

  show(args) {
    if (args !== undefined && args.tabIndex !== undefined) {
      this.setState({ tabIndex: args.tabIndex });
    }

    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }

  render() {
    return (
      <Modal ref={this._setModalRef} tall freshState {...this.props}>
        <ModalHeader>Preferences</ModalHeader>
        <ModalBody noScroll>
          <Tabs
            className="react-tabs"
            selectedIndex={this.state.tabIndex}
            onSelect={tabIndex => this.goTo(tabIndex)}
          >
            <TabList>
              <Tab>
                <button>General</button>
              </Tab>

              <Tab>
                <button>Themes</button>
              </Tab>

              <Tab>
                <button>Network</button>
              </Tab>

              <Tab>
                <button>About</button>
              </Tab>
            </TabList>

            <TabPanel className="react-tabs__tab-panel pad scrollable">
              <GeneralSettingsTab />
            </TabPanel>

            <TabPanel className="react-tabs__tab-panel scrollable">
              <ThemeSettingsTab
                activeTheme={this.context.settings.activeTheme}
                changeTheme={this.context.changeSetting.bind(
                  null,
                  'activeTheme'
                )}
              />
            </TabPanel>

            <TabPanel className="react-tabs__tab-panel scrollable">
              <NetworkSettingsTab
                orientation={this.context.settings.browserNetworkOrientation}
                changeSetting={this.context.changeSetting}
              />
            </TabPanel>

            <TabPanel className="react-tabs__tab-panel pad scrollable">
              <AboutSettingsTab />
            </TabPanel>
          </Tabs>
        </ModalBody>
      </Modal>
    );
  }
}

SettingsModal.contextType = SettingsContext;
