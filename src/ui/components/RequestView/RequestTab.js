import React, { Component } from 'react';
import PaneRemaining from '../pane/PaneRemaining';
import { Dropdown, DropdownButton, DropdownItem } from '../dropdown';

type Props = {
  showModifiedRequest: 'boolean',
  setOriginalRequest: 'function',
  setModifiedRequest: 'function',
  requestModified: 'boolean',
  method: 'string',
  url: 'string',
  headers: 'object',
  payload: 'string'
};

export default class RequestsTab extends Component<Props> {
  props: Props;

  renderIcon(option) {
    const original =
      option === 'original' && this.props.showModifiedRequest === false;
    const modified =
      option === 'modified' && this.props.showModifiedRequest === true;

    if (original || modified) {
      return <i className="fa fa-check" />;
    } else {
      return <i className="fa fa-empty" />;
    }
  }

  render() {
    const dropdownTitle =
      this.props.showModifiedRequest === true ? 'Modified' : 'Original';

    let payloadContent;
    if (this.props.payload !== null) {
      payloadContent = (
        <>
          <br />
          <br />
          <span>Payload:</span>
          <br />
          <span className="selectable force-wrap">{this.props.payload}</span>
        </>
      );
    }

    let modifiedDropdown;
    if (this.props.requestModified === 1) {
      modifiedDropdown = (
        <div style={{ textAlign: 'right' }}>
          <Dropdown className="browser-sessions pull-right">
            <DropdownButton className="pointer btn btn--outlined btn--super-compact">
              {dropdownTitle}
              <i className="fa fa-caret-down space-left" />
            </DropdownButton>

            <DropdownItem
              onClick={this.props.setOriginalRequest}
              style={{ minWidth: '120px' }}
            >
              {this.renderIcon('original')} Original
            </DropdownItem>
            <DropdownItem
              onClick={this.props.setModifiedRequest}
              style={{ minWidth: '120px' }}
            >
              {this.renderIcon('modified')} Modified
            </DropdownItem>
          </Dropdown>
        </div>
      );
    }

    return (
      <PaneRemaining>
        <div className="request-tab-panel">
          <div className="row-fill row-fill--top">
            <div className="selectable force-wrap">
              <span className={`http-method-${this.props.method}`}>
                {this.props.method}
              </span>{' '}
              {this.props.url}
            </div>

            {modifiedDropdown}
          </div>

          <br />
          <span>Headers:</span>
          <br />
          <table
            key="table"
            className="table--fancy table--striped table--compact"
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(this.props.headers).map((key, i) => (
                <tr className="selectable" key={i}>
                  <td style={{ whiteSpace: 'nowrap' }} className="force-wrap">
                    {key}
                  </td>
                  <td className="force-wrap">{this.props.headers[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {payloadContent}
        </div>
      </PaneRemaining>
    );
  }
}
