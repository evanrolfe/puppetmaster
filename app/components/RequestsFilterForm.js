// @flow
import * as React from 'react';

import { registerModal, showModal } from './modals/index';
import DisplayFiltersModal from './modals/DisplayFiltersModal';
import CaptureFiltersModal from './modals/CaptureFiltersModal';

type Props = {
  allStatusCodes: 'array',
  allResourceTypes: 'array',
  allBrowsers: 'array',
  filters: 'object',
  setFilters: 'function',
  setSearch: 'function'
};

export default class RequestsFilterForm extends React.PureComponent<Props> {
  constructor(props) {
    super(props);

    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch(event) {
    this.props.setSearch(event.target.value);
  }

  render() {
    return (
      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <DisplayFiltersModal
          ref={registerModal}
          allStatusCodes={this.props.allStatusCodes}
          allResourceTypes={this.props.allResourceTypes}
          allBrowsers={this.props.allBrowsers}
          origFilters={this.props.filters}
          setFilters={this.props.setFilters}
        />

        <CaptureFiltersModal
          ref={registerModal}
          allResourceTypes={this.props.allResourceTypes}
        />

        <div
          className="form-control form-control--outlined"
          style={{
            width: '60%',
            maxWidth: '800px',
            display: 'inline-block'
          }}
        >
          <label>Search:</label>
          <input
            type="text"
            style={{ width: '100%' }}
            placeholder="Enter search term"
            value={this.props.filters.search}
            onChange={this.handleSearch}
          />
        </div>

        <div
          className="form-control form-control--outlined"
          style={{ width: '40%', display: 'inline-block' }}
        >
          <label style={{ marginLeft: '10px' }}>Filters:</label>

          <button
            className="pointer btn btn--outlined btn--super-compact"
            style={{ marginLeft: '10px', display: 'inline-block' }}
            onClick={() => showModal(DisplayFiltersModal)}
          >
            Display
          </button>
          <button
            className="pointer btn btn--outlined btn--super-compact"
            style={{ marginLeft: '10px', display: 'inline-block' }}
            onClick={() => showModal(CaptureFiltersModal)}
          >
            Capture
          </button>
        </div>
      </div>
    );
  }
}
