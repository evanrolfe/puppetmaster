import React, { Component } from 'react';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownDivider
} from '../dropdown';

type Props = {
  viewMode: 'string',
  viewContent: 'string',
  bodyType: 'string',
  selectDropdownItem: 'function'
};

const ALL_VIEW_MODES = [
  { key: 'raw', title: 'Raw' },
  { key: 'pretty', title: 'Pretty' },
  { key: 'preview', title: 'Preview' }
];

const ALL_VIEW_CONTENTS = [
  { key: 'source', title: 'Source' },
  { key: 'render', title: 'Rendered DOM' }
];

export default class ViewModeDropdown extends Component<Props> {
  props: Props;

  getSelectedTitle() {
    return ALL_VIEW_MODES.find(viewMode => viewMode.key === this.props.viewMode)
      .title;
  }

  renderIcon(viewModeKey, viewContentKey) {
    if (
      this.props.viewMode === viewModeKey &&
      this.props.viewContent === viewContentKey
    ) {
      return <i className="fa fa-check" />;
    } else {
      return <i className="fa fa-empty" />;
    }
  }

  renderDropdownItems(viewContent) {
    return [
      <DropdownDivider>{viewContent.title}</DropdownDivider>,
      ALL_VIEW_MODES.map(viewMode => (
        <DropdownItem
          onClick={this.props.selectDropdownItem}
          value={[viewMode.key, viewContent.key]}
        >
          {this.renderIcon(viewMode.key, viewContent.key)} {viewMode.title}
        </DropdownItem>
      ))
    ];
  }

  render() {
    let viewContents;

    if (this.props.bodyType === 'request-html') {
      viewContents = ALL_VIEW_CONTENTS;
    } else if (this.props.bodyType === 'navigation-html') {
      viewContents = ALL_VIEW_CONTENTS.filter(
        viewContent => viewContent.key === 'render'
      );
    } else {
      viewContents = ALL_VIEW_CONTENTS.filter(
        viewContent => viewContent.key === 'source'
      );
    }

    return (
      <Dropdown beside>
        <DropdownButton
          className="pointer btn btn--outlined btn--super-compact"
          style={{ marginLeft: '10px', display: 'inline-block' }}
        >
          {this.getSelectedTitle()}
          <i className="fa fa-caret-down space-left" />
        </DropdownButton>

        {viewContents.map(viewContent => this.renderDropdownItems(viewContent))}
      </Dropdown>
    );
  }
}
