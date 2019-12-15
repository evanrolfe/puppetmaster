import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import autobind from 'autobind-decorator';
import classnames from 'classnames';
import DropdownButton from './dropdown-button';
import DropdownItem from './dropdown-item';
import DropdownDivider from './dropdown-divider';

const dropdownsContainer = document.querySelector('#dropdowns-container');

@autobind
class Dropdown extends PureComponent {
  static _handleMouseDown(e) {
    // Intercept mouse down so that clicks don't trigger things like drag and drop.
    e.preventDefault();
  }

  constructor(props) {
    super(props);

    this.state = {
      open: false,
      dropUp: false,

      // Filter Stuff
      filter: '',
      filterVisible: false,
      filterItems: null,
      filterActiveIndex: 0,

      // Use this to force new menu every time dropdown opens
      uniquenessKey: 0
    };
  }

  componentDidUpdate() {
    this._checkSizeAndPosition();
  }

  _setRef(n) {
    this._node = n;
  }

  _handleCheckFilterSubmit() {}

  _handleChangeFilter() {}

  _checkSizeAndPosition() {
    if (!this.state.open || !this._dropdownList) {
      return;
    }

    // Get dropdown menu
    const dropdownList = this._dropdownList;

    // Compute the size of all the menus
    const dropdownBtnRect = this._node.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();
    const dropdownListRect = dropdownList.getBoundingClientRect();

    // Should it drop up?
    const bodyHeight = bodyRect.height;
    const dropdownTop = dropdownBtnRect.top;
    const dropUp = dropdownTop > bodyHeight - 200;

    // Reset all the things so we can start fresh
    this._dropdownList.style.left = 'initial';
    this._dropdownList.style.right = 'initial';
    this._dropdownList.style.top = 'initial';
    this._dropdownList.style.bottom = 'initial';
    this._dropdownList.style.minWidth = 'initial';
    this._dropdownList.style.maxWidth = 'initial';

    const screenMargin = 6;

    const { right, wide } = this.props;
    if (right || wide) {
      const { right: originalRight } = dropdownBtnRect;

      // Prevent dropdown from squishing against left side of screen
      const right2 = Math.max(
        dropdownListRect.width + screenMargin,
        originalRight
      );

      const { beside } = this.props;
      const offset = beside ? dropdownBtnRect.width - 40 : 0;
      this._dropdownList.style.right = `${bodyRect.width - right2 + offset}px`;
      this._dropdownList.style.maxWidth = `${Math.min(
        dropdownListRect.width,
        right2 + offset
      )}px`;
    }

    if (!right || wide) {
      const { left: originalLeft } = dropdownBtnRect;

      const { beside } = this.props;
      const offset = beside ? dropdownBtnRect.width - 40 : 0;

      // Prevent dropdown from squishing against right side of screen
      const left = Math.min(
        bodyRect.width - dropdownListRect.width - screenMargin,
        originalLeft
      );

      this._dropdownList.style.left = `${left + offset}px`;
      this._dropdownList.style.maxWidth = `${Math.min(
        dropdownListRect.width,
        bodyRect.width - left - offset
      )}px`;
    }

    if (dropUp) {
      const { top } = dropdownBtnRect;
      this._dropdownList.style.bottom = `${bodyRect.height - top}px`;
      this._dropdownList.style.maxHeight = `${top - screenMargin}px`;
    } else {
      const { bottom } = dropdownBtnRect;
      this._dropdownList.style.top = `${bottom}px`;
      this._dropdownList.style.maxHeight = `${bodyRect.height -
        bottom -
        screenMargin}px`;
    }
  }

  _handleClick() {
    this.toggle();
  }

  _addDropdownListRef(n) {
    this._dropdownList = n;
  }

  _addFilterRef(n) {
    this._filter = n;

    // Automatically focus the filter element when mounted so we can start typing
    if (this._filter) {
      this._filter.focus();
    }
  }

  _addDropdownMenuRef(n) {
    this._dropdownMenu = n;
  }

  _getFlattenedChildren(children) {
    let newChildren = [];

    for (const child of children) {
      if (!child) {
        // Ignore null components
        continue;
      }

      if (Array.isArray(child)) {
        newChildren = [...newChildren, ...this._getFlattenedChildren(child)];
      } else {
        newChildren.push(child);
      }
    }

    return newChildren;
  }

  hide() {
    // Focus the dropdown button after hiding
    if (this._node) {
      const button = this._node.querySelector('button');
      if (button) button.focus();
    }

    this.setState({ open: false });
    if (this.props.onHide) this.props.onHide();
  }

  show(filterVisible = false) {
    const bodyHeight = document.body.getBoundingClientRect().height;
    const dropdownTop = this._node.getBoundingClientRect().top;
    const dropUp = dropdownTop > bodyHeight - 200;

    this.setState(prevState => ({
      open: true,
      dropUp,
      filterVisible,
      filter: '',
      filterItems: null,
      filterActiveIndex: -1,
      uniquenessKey: prevState.uniquenessKey + 1
    }));

    if (this.props.onOpen) this.props.onOpen();
  }

  toggle(filterVisible = false) {
    if (this.state.open) {
      this.hide();
    } else {
      this.show(filterVisible);
    }
  }

  render() {
    const { right, outline, wide, className, style, children } = this.props;

    const {
      dropUp,
      open,
      uniquenessKey,
      filterVisible,
      filterActiveIndex,
      filterItems,
      filter
    } = this.state;

    const classes = classnames('dropdown', className, {
      'dropdown--wide': wide,
      'dropdown--open': open
    });

    const menuClasses = classnames({
      dropdown__menu: true,
      'theme--dropdown__menu': true,
      'dropdown__menu--open': open,
      'dropdown__menu--outlined': outline,
      'dropdown__menu--up': dropUp,
      'dropdown__menu--right': right
    });

    const dropdownButtons = [];
    const dropdownItems = [];

    const listedChildren = Array.isArray(children) ? children : [children];
    const allChildren = this._getFlattenedChildren(listedChildren);

    const visibleChildren = allChildren.filter((child, i) => {
      if (child.type.name !== DropdownItem.name) {
        return true;
      }

      // It's visible if its index is in the filterItems
      return !filterItems || filterItems.includes(i);
    });

    for (let i = 0; i < allChildren.length; i++) {
      const child = allChildren[i];
      if (child.type.name === DropdownButton.name) {
        dropdownButtons.push(child);
      } else if (child.type.name === DropdownItem.name) {
        const active = i === filterActiveIndex;
        const hide = !visibleChildren.includes(child);
        dropdownItems.push(
          <li
            key={i}
            data-filter-index={i}
            className={classnames({ active, hide })}
          >
            {child}
          </li>
        );
      } else if (child.type.name === DropdownDivider.name) {
        const currentIndex = visibleChildren.indexOf(child);
        const nextChild = visibleChildren[currentIndex + 1];

        // Only show the divider if the next child is a DropdownItem
        if (nextChild && nextChild.type.name === DropdownItem.name) {
          dropdownItems.push(<li key={i}>{child}</li>);
        }
      }
    }

    let finalChildren = [];
    if (dropdownButtons.length !== 1) {
      console.error(
        `Dropdown needs exactly one DropdownButton! Got ${
          dropdownButtons.length
        }`,
        {
          allChildren
        }
      );
    } else {
      const noResults = filter && filterItems && filterItems.length === 0;
      finalChildren = [
        dropdownButtons[0],
        ReactDOM.createPortal(
          <div
            key="item"
            className={menuClasses}
            ref={this._addDropdownMenuRef}
            aria-hidden={!open}
          >
            <div className="dropdown__backdrop theme--transparent-overlay" />
            <div
              key={uniquenessKey}
              ref={this._addDropdownListRef}
              tabIndex="-1"
              className={classnames('dropdown__list', {
                'dropdown__list--filtering': filterVisible
              })}
            >
              <div className="form-control dropdown__filter">
                <i className="fa fa-search" />
                <input
                  type="text"
                  onInput={this._handleChangeFilter}
                  ref={this._addFilterRef}
                  onKeyPress={this._handleCheckFilterSubmit}
                />
              </div>
              {noResults && (
                <div className="text-center pad warning">No match :(</div>
              )}
              <ul className={classnames({ hide: noResults })}>
                {dropdownItems}
              </ul>
            </div>
          </div>,
          dropdownsContainer
        )
      ];
    }

    return (
      <div
        style={style}
        className={classes}
        ref={this._setRef}
        onClick={this._handleClick}
        tabIndex="-1"
        onMouseDown={Dropdown._handleMouseDown}
      >
        {finalChildren}
      </div>
    );
  }
}

Dropdown.propTypes = {
  // Required
  children: PropTypes.node.isRequired,

  // Optional
  right: PropTypes.bool,
  outline: PropTypes.bool,
  wide: PropTypes.bool,
  onOpen: PropTypes.func,
  onHide: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.string,
  beside: PropTypes.bool
};

export default Dropdown;
