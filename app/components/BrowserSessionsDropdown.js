import React, { Component } from 'react';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownDivider
} from './dropdown';

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
    global.backendConn.send('BrowsersController', 'bringToForeground', {
      browserId: browserId
    });
  }

  createSession() {
    global.backendConn.send('BrowsersController', 'create', {});
  }

  render() {
    return (
      <Dropdown className="browser-sessions pull-right">
        <DropdownButton className="browser-sessions">
          Browser Sessions ({this.state.browsers.length})
        </DropdownButton>

        <DropdownDivider>Open Sessions:</DropdownDivider>
        {this.state.browsers.map(browser => (
          <DropdownItem onClick={this.openBrowser} value={browser.id}>
            {browser.title}
          </DropdownItem>
        ))}
        <DropdownDivider>Actions</DropdownDivider>
        <DropdownItem onClick={this.selectDropdownItem}>View All</DropdownItem>
        <DropdownItem onClick={this.createSession}>New Session</DropdownItem>
      </Dropdown>
    );
  }
}
