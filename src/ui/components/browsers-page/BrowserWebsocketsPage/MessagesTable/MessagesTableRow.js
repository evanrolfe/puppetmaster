import React, { Component } from 'react';
import MessagesTableCellData from './MessagesTableCellData';
import MessagesTableCell from './MessagesTableCell';

type Props = {
  websocketMessage: 'object',
  columns: 'array',
  a11yProps: 'object',
  style: 'string',
  isSelected: 'boolean',
  className: 'string',
  handleRightClick: 'function'
};

export default class MessagesTableRow extends Component<Props> {
  shouldComponentUpdate(nextProps) {
    if (this.props.isSelected !== nextProps.isSelected) return true;

    if (this.props.websocketMessage.id === nextProps.websocketMessage.id)
      return false;

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
      handleRightClick,
      columns,
      websocketMessage
    } = this.props;

    let { className } = this.props;

    console.log(`[RENDER] MessageTableRow`);

    if (isSelected) className += ' selected';

    /*
     * NOTE: Here we have to override react-virtualized's columns because they
     *       are using the state which does not come from our hooks.
     */
    const cells = columns.map(column => {
      const cellContent = (
        <MessagesTableCellData
          {...column.columnProps}
          websocketMessage={websocketMessage}
        />
      );

      return (
        <MessagesTableCell {...column.cellProps}>
          {cellContent}
        </MessagesTableCell>
      );
    });

    return (
      <div
        {...a11yProps}
        className={className}
        role="row"
        style={style}
        onContextMenu={handleRightClick}
      >
        {cells}
      </div>
    );
  }
}
