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

    this.state = { sessionTitles: [] };

    this.loadSessions();

    global.backendConn.listen('browsersChanged', () => {
      this.loadSessions();
    });
  }

  async loadSessions() {
    const result = await global.backendConn.send(
      'BrowsersController',
      'index',
      {}
    );
    const sessionTitles = result.result.body;

    this.setState({ sessionTitles: sessionTitles });
  }

  openBrowser(browserIndex) {
    global.backendConn.send('BrowsersController', 'bringToForeground', {
      browserIndex: browserIndex
    });
  }

  createSession() {
    global.backendConn.send('BrowsersController', 'create', {});
  }

  render() {
    return (
      <Dropdown className="browser-sessions pull-right">
        <DropdownButton className="browser-sessions">
          Browser Sessions ({this.state.sessionTitles.length})
        </DropdownButton>

        <DropdownDivider>Open Sessions:</DropdownDivider>
        {this.state.sessionTitles.map((title, index) => (
          <DropdownItem onClick={this.openBrowser} value={index}>
            {title}
          </DropdownItem>
        ))}
        <DropdownDivider>Actions</DropdownDivider>
        <DropdownItem onClick={this.selectDropdownItem}>View All</DropdownItem>
        <DropdownItem onClick={this.createSession}>New Session</DropdownItem>
      </Dropdown>
    );
  }
}
