// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class SideBar extends Component {
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
    } else if (pathname.includes('/attacks')) {
      tabIndex = 2;
    }
    if (pathname.includes('/scans')) {
      tabIndex = 3;
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
      <div id="sidebar" className="theme--sidebar">
        <div
          className={`sidebar-icon theme--sidebar__header ${this.activeClass(
            0
          )}`}
          title="Browser (CTRL+1)"
          onClick={() => this.goTo('/browser/network')}
          role="menuitem"
        >
          <i className="fas fa-window-restore" />
        </div>

        <div
          className={`sidebar-icon theme--sidebar__header ${this.activeClass(
            1
          )}`}
          title="Crawler (CTRL+2)"
          onClick={() => this.goTo('/crawler')}
          role="menuitem"
        >
          <i className="fas fa-spider" />
        </div>

        <div
          className={`sidebar-icon theme--sidebar__header ${this.activeClass(
            2
          )}`}
          title="Attacks (CTRL+3)"
          onClick={() => this.goTo('/attacks')}
          role="menuitem"
        >
          <i className="fas fa-crosshairs" />
        </div>

        <div
          className={`sidebar-icon theme--sidebar__header ${this.activeClass(
            3
          )}`}
          title="Scans (CTRL+4)"
          onClick={() => this.goTo('/scans')}
          role="menuitem"
        >
          <i className="fas fa-rss" />
        </div>
      </div>
    );
  }
}

SideBar.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired
};
