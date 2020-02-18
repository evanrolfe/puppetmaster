import React, { Component } from 'react';
import RequestsTableCellData from './RequestsTableCellData';
import RequestsTableCell from './RequestsTableCell';

type Props = {
  request: 'object',
  columns: 'array',
  a11yProps: 'object',
  style: 'string',
  isSelected: 'boolean',
  className: 'string',
  handleRightClick: 'function'
};

export default class RequestTableRow extends Component<Props> {
  shouldComponentUpdate(nextProps) {
    if (this.props.isSelected !== nextProps.isSelected) return true;

    // If the request has had its browser saved
    if (this.props.request.browser_id === nextProps.request.browser_id)
      return true;

    // If the request has had its response saved
    console.log(
      `Request: ${this.props.request.id}, response_status: ${this.props.request.response_status}, next: ${nextProps.request.response_status}`
    );
    if (
      this.props.request.response_status !== nextProps.request.response_status
    )
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
      handleRightClick,
      columns,
      request
    } = this.props;

    let { className } = this.props;

    console.log(`[RENDER] RequestTableRow`);

    if (isSelected) className += ' selected';

    /*
     * NOTE: Here we have to override react-virtualized's columns because they
     *       are using the state which does not come from our hooks.
     */
    const cells = columns.map(column => {
      const cellContent = (
        <RequestsTableCellData {...column.columnProps} request={request} />
      );
      return (
        <RequestsTableCell {...column.cellProps}>
          {cellContent}
        </RequestsTableCell>
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
