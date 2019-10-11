import React, { Component } from 'react';
import { ALL_TABLE_COLUMNS } from '../pages/BrowserNetworkPage';

export default class NetworkSettingsTab extends Component {
  render() {
    return (
      <div className="pad">
        <div className="row-fill row-fill--top">
          <div className="form-control form-control--outlined">
            <label>
              Layout Orientation
              <select name="orientation">
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </label>
          </div>

          <div className="form-control form-control--thin">
            <label className="strong">Request Table Columns:</label>

            {ALL_TABLE_COLUMNS.map(column => (
              <label>
                {column.title}
                <input type="checkbox" value={column.key} />
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
