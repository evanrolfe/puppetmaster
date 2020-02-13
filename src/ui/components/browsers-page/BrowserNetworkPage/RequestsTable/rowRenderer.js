import * as React from 'react';
import RequestTableRowState from './RequestTableRowState';

/*
 * NOTE: We have monkey-patched the rowRenderer function from react-virtualized
 *       in order to make it use our own RequestTableRow componenent. This
 *       component implemented shouldComponentUpdate so that it doesn't
 *       re-render the row unecessarily.
 */

type Props = {
  className: 'string',
  columns: 'array',
  index: 'number',
  onRowClick: 'function',
  onRowDoubleClick: 'function',
  onRowMouseOut: 'function',
  onRowMouseOver: 'function',
  onRowRightClick: 'function',
  rowData: 'object',
  style: 'string'
};

export default function rowRenderer({
  className,
  columns,
  index,
  onRowClick,
  onRowDoubleClick,
  onRowMouseOut,
  onRowMouseOver,
  onRowRightClick,
  rowData,
  style
}: Props) {
  const a11yProps = { 'aria-rowindex': index + 1 };

  if (
    onRowClick ||
    onRowDoubleClick ||
    onRowMouseOut ||
    onRowMouseOver ||
    onRowRightClick
  ) {
    a11yProps['aria-label'] = 'row';
    a11yProps.tabIndex = 0;

    if (onRowClick) {
      a11yProps.onMouseDown = event => onRowClick({ event, index, rowData });
    }
    if (onRowDoubleClick) {
      a11yProps.onDoubleClick = event =>
        onRowDoubleClick({ event, index, rowData });
    }
    if (onRowMouseOut) {
      a11yProps.onMouseOut = event => onRowMouseOut({ event, index, rowData });
    }
    if (onRowMouseOver) {
      a11yProps.onMouseOver = event =>
        onRowMouseOver({ event, index, rowData });
    }
    if (onRowRightClick) {
      a11yProps.onContextMenu = event =>
        onRowRightClick({ event, index, rowData });
    }
  }

  return (
    <RequestTableRowState
      key={rowData.id}
      request={rowData}
      className={className}
      role="row"
      style={style}
      a11yProps={a11yProps}
    >
      {columns}
    </RequestTableRowState>
  );
}
