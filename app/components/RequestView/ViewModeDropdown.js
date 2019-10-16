import React, { Component } from 'react';
import { Dropdown, DropdownButton, DropdownItem } from '../dropdown';

type Props = {
  viewMode: 'string',
  setViewMode: 'function'
};

const VIEW_MODES = [
  { key: 'pretty', title: 'Pretty' },
  { key: 'raw', title: 'Raw' },
  { key: 'preview', title: 'Preview' },
  { key: 'parsed', title: 'Parsed DOM' }
];

export default class ViewModeDropdown extends Component<Props> {
  props: Props;

  getSelectedTitle() {
    return VIEW_MODES.find(viewMode => viewMode.key === this.props.viewMode)
      .title;
  }

  renderIcon(viewModeKey) {
    if (this.props.viewMode === viewModeKey) {
      return <i className="fa fa-check" />;
    } else {
      return <i className="fa fa-empty" />;
    }
  }

  render() {
    return (
      <Dropdown beside>
        <DropdownButton
          className="pointer btn btn--outlined btn--super-compact"
          style={{ marginLeft: '10px', display: 'inline-block' }}
        >
          {this.getSelectedTitle()}
          <i className="fa fa-caret-down space-left" />
        </DropdownButton>

        {VIEW_MODES.map(viewMode => (
          <DropdownItem onClick={this.props.setViewMode} value={viewMode.key}>
            {this.renderIcon(viewMode.key)} {viewMode.title}
          </DropdownItem>
        ))}
      </Dropdown>
    );
  }
}
