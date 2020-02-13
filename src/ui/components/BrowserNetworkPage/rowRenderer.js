import * as React from 'react';
import RequestTableRow from './RequestTableRow';

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
  key: 'string',
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
  key,
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
      a11yProps.onClick = event => onRowClick({ event, index, rowData });
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
    <div
      {...a11yProps}
      className={className}
      key={key}
      role="row"
      style={style}
    >
      <RequestTableRow key={rowData.id} request={rowData}>
        {columns}
      </RequestTableRow>
    </div>
  );
}
