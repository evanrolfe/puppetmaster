// @flow
import * as React from 'react';

import { registerModal, showModal } from '../modals/index';
import DisplayFiltersModal from '../modals/DisplayFiltersModal';
import CaptureFiltersModal from '../modals/CaptureFiltersModal';

type Props = {
  allStatusCodes: 'array',
  allResourceTypes: 'array',
  allBrowsers: 'array',
  filters: 'object',
  handleSearch: 'function',
  setFilters: 'function'
};

export default ({
  allStatusCodes,
  allResourceTypes,
  allBrowsers,
  filters,
  handleSearch,
  setFilters
}: Props) => {
  console.log(`Rendering RequestsFilterForm:`);

  return (
    <div className="pane-control">
      <DisplayFiltersModal
        ref={registerModal}
        allStatusCodes={allStatusCodes}
        allResourceTypes={allResourceTypes}
        allBrowsers={allBrowsers}
        origFilters={filters}
        setFilters={setFilters}
      />

      <CaptureFiltersModal
        ref={registerModal}
        allResourceTypes={allResourceTypes}
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
          value={filters.search}
          onChange={handleSearch}
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
};
