// @flow
import * as React from 'react';

import { registerModal, showModal } from './modals/index';
import DisplayFiltersModal from './modals/DisplayFiltersModal';
import SettingsModal from './modals/SettingsModal';

type Props = {
  allStatusCodes: 'array',
  allResourceTypes: 'array',
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
      <>
        <DisplayFiltersModal
          ref={registerModal}
          allStatusCodes={this.props.allStatusCodes}
          allResourceTypes={this.props.allResourceTypes}
          origFilters={this.props.filters}
          setFilters={this.props.setFilters}
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
          >
            Capture
          </button>

          <button
            className="pointer btn btn--outlined btn--super-compact"
            style={{ marginLeft: '10px', display: 'inline-block' }}
            onClick={() => showModal(SettingsModal, { tabIndex: 2 })}
          >
            <i className="fas fa-cog" />
          </button>
        </div>
      </>
    );
  }
}
