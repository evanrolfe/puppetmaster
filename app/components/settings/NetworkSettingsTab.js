import React, { Component } from 'react';
import { ALL_TABLE_COLUMNS } from '../pages/BrowserNetworkPage';

type Props = {
  changeSetting: 'function',
  orientation: 'string'
};

export default class NetworkSettingsTab extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.changeOrientation = this.changeOrientation.bind(this);
  }

  changeOrientation(event) {
    const value = event.target.value;

    this.props.changeSetting('browserNetworkOrientation', value);
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
                value={this.props.orientation}
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
                <input type="checkbox" value={column.key} />
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
