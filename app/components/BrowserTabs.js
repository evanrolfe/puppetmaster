// @flow
import React, { Component } from 'react';
import { Tab, TabList, Tabs } from 'react-tabs';
import PropTypes from 'prop-types';

export default class BrowserTabs extends Component {
  constructor(props) {
    super(props);
    this.state = { tabIndex: 0 };
  }

  componentDidMount() {
    this.setActiveTabIndex(this.props.location.pathname);
  }

  componentDidUpdate(previousProps) {
    if (this.props.location.pathname !== previousProps.location.pathname) {
      this.setActiveTabIndex(this.props.location.pathname);
    }
  }

  setActiveTabIndex(pathname) {
    let tabIndex;

    switch (pathname) {
      case '/browser/network':
        tabIndex = 0;
        break;
      case '/browser/intercept':
        tabIndex = 1;
        break;
      case '/browser/sessions':
        tabIndex = 2;
        break;
      default:
        tabIndex = 0;
    }

    const newState = Object.assign({}, this.state);
    newState.tabIndex = tabIndex;
    this.setState(newState);
  }

  goTo(tabIndex) {
    let path;

    switch (tabIndex) {
      case 0:
        path = '/browser/network';
        break;
      case 1:
        path = '/browser/intercept';
        break;
      case 2:
        path = '/browser/sessions';
        break;
      default:
        path = '/browser/network';
    }

    this.props.history.push(path);
  }

  render() {
    return (
      <Tabs
        selectedIndex={this.state.tabIndex}
        onSelect={tabIndex => this.goTo(tabIndex)}
        className="pane__tabs theme--pane__body react-tabs"
      >
        <TabList>
          <Tab>
            <button type="button">Network</button>
          </Tab>

          <Tab>
            <button type="button">Intercept</button>
          </Tab>

          <Tab>
            <button type="button">Sessions</button>
          </Tab>
        </TabList>
      </Tabs>
    );
  }
}

BrowserTabs.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired
};
