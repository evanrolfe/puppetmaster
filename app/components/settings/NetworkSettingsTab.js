import React from 'react';
import { useDispatch, useSelector, ALL_TABLE_COLUMNS } from '../../state/state';

export default () => {
  const dispatch = useDispatch();
  const orientation = useSelector(
    state => state.browserNetworkPage.page.orientation
  );
  const requestsTableColumns = useSelector(
    state => state.browserNetworkPage.requestsTableColumns
  );

  const changeOrientation = event => {
    const value = event.target.value;
    dispatch({
      type: 'SET_ORIENTATION_STORAGE',
      orientation: value,
      page: 'browserNetworkPage'
    });
  };

  const tableColumnIsChecked = columnKey =>
    requestsTableColumns.map(col => col.key).includes(columnKey);

  const _handleTableColumnChange = event => {
    const value = event.target.value;
    const checked = event.target.checked;

    let newTableColumns = [...requestsTableColumns];
    if (checked === true) {
      const newCol = ALL_TABLE_COLUMNS.find(col => col.key === value);
      newTableColumns.push(newCol);

      // Preserve the original order of columns:
      const origColKeys = ALL_TABLE_COLUMNS.map(col => col.key);
      newTableColumns.sort(
        (colA, colB) =>
          origColKeys.indexOf(colA.key) - origColKeys.indexOf(colB.key)
      );
    } else {
      newTableColumns = newTableColumns.filter(col => col.key !== value);
    }

    dispatch({
      type: 'SET_TABLECOLUMNS_STORAGE',
      requestsTableColumns: newTableColumns,
      page: 'browserNetworkPage'
    });
  };

  return (
    <div className="pad">
      <div className="row-fill row-fill--top">
        <div className="form-control form-control--outlined">
          <label>
            Layout Orientation
            <select
              name="orientation"
              value={orientation}
              onChange={changeOrientation}
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </label>
        </div>

        <div className="form-control form-control--thin">
          <label className="strong">Request Table Columns:</label>

          {ALL_TABLE_COLUMNS.map(column => (
            <label>
              {column.title}
              <input
                type="checkbox"
                value={column.key}
                checked={tableColumnIsChecked(column.key)}
                onChange={_handleTableColumnChange}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
