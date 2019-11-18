import React from 'react';

import { ALL_TABLE_COLUMNS } from '../components/pages/BrowserNetworkPage';
import SettingsContext from './SettingsContext';

type Props = {
  children: 'object'
};

// TODO: Try using: https://github.com/dai-shi/react-tracked
export default class SettingsProvider extends React.Component<Props> {
  props: Props;

  constructor(props) {
    super(props);

    const selectedColumns = [
      'id',
      'title',
      'method',
      'host',
      'path',
      'response_status',
      'request_type'
    ];

    const requestsTableColumns = ALL_TABLE_COLUMNS.filter(column =>
      selectedColumns.includes(column.key)
    );

    this.state = {
      activeTheme: 'default',
      browserNetworkOrientation: 'vertical',
      requestsTableColumns: requestsTableColumns,
      paneWidth: 700,
      paneHeight: 350,
      changeSetting: this.changeSetting.bind(this)
    };
  }

  changeSetting(key, value) {
    console.log(`ChangeSetting: ${key} => ${value}`);
    this.setState(prevState => {
      const newState = Object.assign({}, prevState);
      newState[key] = value;
      return newState;
    });
  }

  render() {
    return (
      <SettingsContext.Provider value={{ ...this.state }}>
        {this.props.children}
      </SettingsContext.Provider>
    );
  }
}
