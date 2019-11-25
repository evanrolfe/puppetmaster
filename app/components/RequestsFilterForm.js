// @flow
import * as React from 'react';

import { useTrackedState, useDispatch } from '../state/state';
import { registerModal, showModal } from './modals/index';
import DisplayFiltersModal from './modals/DisplayFiltersModal';
import CaptureFiltersModal from './modals/CaptureFiltersModal';

type Props = {
  allStatusCodes: 'array',
  allResourceTypes: 'array',
  allBrowsers: 'array'
};

export default ({ allStatusCodes, allResourceTypes, allBrowsers }: Props) => {
  const state = useTrackedState();
  const dispatch = useDispatch();
  const { filters } = state;

  console.log(`Rendering RequestsFilterForm:`);

  const handleSearch = e => {
    dispatch({ type: 'SEARCH_REQUESTS', value: e.target.value });
  };

  const setFilters = filters1 => {
    dispatch({ type: 'FILTER_REQUESTS', filters: filters1 });
  };

  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
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
