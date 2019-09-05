import React, { Component } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Modal from '../components/modals/Modal';
import ModalBody from '../components/modals/ModalBody';
import ModalHeader from '../components/modals/ModalHeader';

import AboutSettingsTab from '../components/settings/AboutSettingsTab';
import GeneralSettingsTab from '../components/settings/GeneralSettingsTab';
import ThemeSettingsTab from '../components/settings/ThemeSettingsTab';

export const TAB_INDEX_EXPORT = 1;
export const TAB_INDEX_SHORTCUTS = 3;

class PreferencesModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this._setModalRef = this._setModalRef.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  _setModalRef(n) {
    this.modal = n;
  }

  show() {
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
          <Tabs className="react-tabs">
            <TabList>
              <Tab>
                <button>General</button>
              </Tab>

              <Tab>
                <button>Themes</button>
              </Tab>

              <Tab>
                <button>About</button>
              </Tab>
            </TabList>

            <TabPanel className="react-tabs__tab-panel pad scrollable">
              <GeneralSettingsTab />
            </TabPanel>

            <TabPanel className="react-tabs__tab-panel scrollable">
              <ThemeSettingsTab />
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

export default PreferencesModal;
