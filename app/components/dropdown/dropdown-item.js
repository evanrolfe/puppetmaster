import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';

@autobind
class DropdownItem extends PureComponent {
  _handleClick(e) {
    const { stayOpenAfterClick, onClick, disabled } = this.props;

    if (stayOpenAfterClick) {
      e.stopPropagation();
    }

    if (!onClick || disabled) {
      return;
    }

    if (this.props.hasOwnProperty('value')) {
      onClick(this.props.value, e);
    } else {
      onClick(e);
    }
  }

  render() {
    const {
      buttonClass,
      children,
      className,
      color,
      onClick, // eslint-disable-line no-unused-vars
      stayOpenAfterClick, // eslint-disable-line no-unused-vars
      ...props
    } = this.props;

    if (this.props.browserLink) {
      return (
        <div className="dropdown__button">
          <div className="pane-container-horizontal">
            <div
              className="pane-remaining first-button"
              onClick={this._handleClick}
            >
              {this.props.browserTitle}
            </div>

            <div
              className="pane-fixed  second-button"
              onClick={this.props.editBrowser}
            >
              <i className="fas fa-pen edit-icon" />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <button
          className="dropdown__button"
          onClick={this._handleClick}
          {...props}
        >
          <div className="dropdown__inner">
            <div className="dropdown__text">{children}</div>
          </div>
        </button>
      );
    }
  }
}

DropdownItem.propTypes = {
  buttonClass: PropTypes.any,
  stayOpenAfterClick: PropTypes.bool,
  value: PropTypes.any,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  color: PropTypes.string
};

export default DropdownItem;
