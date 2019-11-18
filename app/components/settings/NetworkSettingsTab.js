import React, { Component } from 'react';
import { ALL_TABLE_COLUMNS } from '../pages/BrowserNetworkPage';
import SettingsContext from '../../lib/SettingsContext';

export default class NetworkSettingsTab extends Component<Props> {
  props: Props;

  constructor(props, context) {
    super(props, context);
    this.context = context;

    this.state = {
      tableColumnKeys: this.context.requestsTableColumns.map(col => col.key)
    };

    this.changeOrientation = this.changeOrientation.bind(this);
    this._handleTableColumnChange = this._handleTableColumnChange.bind(this);
    this.tableColumnIsChecked = this.tableColumnIsChecked.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.tableColumnKeys !== prevState.tableColumnKeys) {
      // Save the state to settings:
      const newTableColumns = [];
      const currentTableColumnKeys = this.context.requestsTableColumns.map(
        col => col.key
      );

      ALL_TABLE_COLUMNS.forEach(col => {
        const isChecked = this.state.tableColumnKeys.includes(col.key);
        const isDisplayedCurrently = currentTableColumnKeys.includes(col.key);

        if (isChecked && isDisplayedCurrently) {
          const currentCol = this.context.requestsTableColumns.find(
            curCol => curCol.key === col.key
          );
          newTableColumns.push(currentCol);
        } else if (isChecked && !isDisplayedCurrently) {
          newTableColumns.push(col);
        }
      });
      this.context.changeSetting('requestsTableColumns', newTableColumns);
    }
  }

  changeOrientation(event) {
    const value = event.target.value;

    this.context.changeSetting('browserNetworkOrientation', value);
  }

  tableColumnIsChecked(columnKey) {
    return this.state.tableColumnKeys.includes(columnKey);
  }

  _handleTableColumnChange(event) {
    const value = event.target.value;
    const checked = event.target.checked;

    // Update the tableColumnKeys state:
    if (checked === true) {
      this.setState(prevState => {
        const newKeys = [...prevState.tableColumnKeys];
        newKeys.push(value);
        return { tableColumnKeys: newKeys };
      });
    } else {
      this.setState(prevState => {
        const newKeys = [...prevState.tableColumnKeys].filter(
          colKey => colKey !== value
        );
        return { tableColumnKeys: newKeys };
      });
    }
  }

  render() {
    return (
      <div className="pad">
        <div className="row-fill row-fill--top">
          <div className="form-control form-control--outlined">
            <label>
              Layout Orientation
              <select
                name="orientation"
                value={this.context.browserNetworkOrientation}
                onChange={this.changeOrientation}
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
                  checked={this.tableColumnIsChecked(column.key)}
                  onChange={this._handleTableColumnChange}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

NetworkSettingsTab.contextType = SettingsContext;
