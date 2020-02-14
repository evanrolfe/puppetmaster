import React, { Component } from 'react';

type Props = {
  request: 'object',
  children: 'array',
  a11yProps: 'object',
  style: 'string',
  isSelected: 'boolean',
  className: 'string',
  handleRightClick: 'function'
};

export default class RequestTableRow extends Component<Props> {
  shouldComponentUpdate(nextProps) {
    if (this.props.isSelected !== nextProps.isSelected) return true;
    if (this.props.request.browser_id === nextProps.request.browser_id)
      return true;

    if (this.props.request.id === nextProps.request.id) return false;

    return true;
  }

  selectItem(item) {
    console.log(`Selecting item ${item}`);
  }

  render() {
    const {
      a11yProps,
      style,
      isSelected,
      children,
      handleRightClick
    } = this.props;

    let { className } = this.props;

    console.log(`[RENDER] RequestTableRow`);

    if (isSelected) className += ' selected';

    return (
      <div
        {...a11yProps}
        className={className}
        role="row"
        style={style}
        onContextMenu={handleRightClick}
      >
        {children}
      </div>
    );
  }
}
