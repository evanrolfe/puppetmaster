// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = { tabIndex: 0 };
    this.goTo = this.goTo.bind(this);
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

    if (pathname.includes('/browser')) {
      tabIndex = 0;
    } else if (pathname.includes('/crawler')) {
      tabIndex = 1;
    } else if (pathname.includes('/requests')) {
      tabIndex = 2;
    } else if (pathname.includes('/scans')) {
      tabIndex = 3;
    } else {
      tabIndex = 0;
    }

    const newState = Object.assign({}, this.state);
    newState.tabIndex = tabIndex;
    this.setState(newState);
  }

  activeClass(index) {
    if (index === this.state.tabIndex) {
      return ' active';
    }

    return '';
  }

  goTo(path) {
    this.props.history.push(path);
  }

  render() {
    return (
      <div className="app-sidebar theme--sidebar">
        <div
          className={`sidebar-icon theme--sidebar__header ${this.activeClass(
            0
          )}`}
          title="Browser (CTRL+1)"
          onMouseDown={() => this.goTo('/browser/network')}
          role="menuitem"
        >
          <i className="fas fa-window-restore" />
        </div>

        <div
          className={`sidebar-icon theme--sidebar__header ${this.activeClass(
            2
          )}`}
          title="Requests (CTRL+3)"
          onMouseDown={() => this.goTo('/requests')}
          role="menuitem"
        >
          <i className="fas fa-crosshairs" />
        </div>
      </div>
    );
  }
}

Sidebar.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired
};
