import React, { Component } from 'react';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownDivider
} from './dropdown';
import EditBrowserModal from './modals/EditBrowserModal';

type Props = {};

export default class BrowserSessionsDropdown extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);

    this.state = { browsers: [] };

    this.loadBrowsers();

    global.backendConn.listen('browsersChanged', () => {
      this.loadBrowsers();
    });
    this.browserModals = {};

    this.registerModal = this.registerModal.bind(this);
    this._setDropdownRef = this._setDropdownRef.bind(this);
    this.saveBrowserTitle = this.saveBrowserTitle.bind(this);
  }

  async loadBrowsers() {
    const result = await global.backendConn.send(
      'BrowsersController',
      'index',
      {}
    );
    const browsers = result.result.body;

    this.setState({ browsers: browsers });
  }

  openBrowser(browserId) {
    global.backendConn.send('BrowsersController', 'open', {
      browserId: browserId
    });
  }

  createSession() {
    global.backendConn.send('BrowsersController', 'create', {});
  }

  editBrowser(browserId, event) {
    event.stopPropagation();

    this.dropdownRef.toggle();
    this.browserModals[browserId].show();
  }

  saveBrowserTitle(browserId, title) {
    console.log(`Saving browser id: ${browserId} with title: ${title}`);
    global.backendConn.send('BrowsersController', 'update', {
      browserId: browserId,
      title: title
    });
  }

  displayBrowserTitle(browser) {
    return (
      <>
        {browser.title}
        <span
          className="pull-right"
          onClick={event => this.editBrowser(event, browser.id)}
        >
          <i className="fas fa-pen edit-icon" />
        </span>
      </>
    );
  }

  registerModal(instance) {
    this.browserModals[instance.props.browser.id] = instance;
  }

  _setDropdownRef(ref) {
    this.dropdownRef = ref;
  }

  render() {
    return (
      <>
        {this.state.browsers.map(browser => (
          <EditBrowserModal
            ref={this.registerModal}
            browser={browser}
            saveBrowserTitle={this.saveBrowserTitle}
          />
        ))}

        <Dropdown
          ref={this._setDropdownRef}
          className="browser-sessions pull-right"
        >
          <DropdownButton className="browser-sessions">
            Browser Sessions ({this.state.browsers.length})
          </DropdownButton>

          <DropdownDivider>Browser Sessions:</DropdownDivider>
          {this.state.browsers.map(browser => (
            <DropdownItem
              browserLink
              browserTitle={browser.title}
              onClick={() => this.openBrowser(browser.id)}
              editBrowser={this.editBrowser.bind(this, browser.id)}
            />
          ))}
          <DropdownDivider>Actions:</DropdownDivider>
          <DropdownItem onClick={this.createSession}>
            <span style={{ paddingLeft: '8px' }}>New Session</span>
          </DropdownItem>
        </Dropdown>
      </>
    );
  }
}
