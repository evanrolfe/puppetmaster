import React from 'react';

import { useDispatch, useSelector } from '../../state/state';
import RequestsFilterForm from '../RequestsFilterForm';
import { RESOURCE_TYPES, STATUS_CODES } from '../pages/BrowserNetworkPage';

export default () => {
  const dispatch = useDispatch();
  const filters = useSelector(state => state.browserNetworkPage.filters);

  const handleSearch = e => {
    dispatch({ type: 'SEARCH_REQUESTS', value: e.target.value });
  };

  const setFilters = filters1 => {
    dispatch({ type: 'FILTER_REQUESTS', filters: filters1 });
  };

  return (
    <RequestsFilterForm
      allStatusCodes={STATUS_CODES}
      allResourceTypes={RESOURCE_TYPES}
      allBrowsers={[]}
      filters={filters}
      handleSearch={handleSearch}
      setFilters={setFilters}
    />
  );
};
