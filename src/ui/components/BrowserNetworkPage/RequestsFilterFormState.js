import React from 'react';

import { useDispatch, useSelector } from '../../state/state';
import RequestsFilterForm from './RequestsFilterForm';

const RESOURCE_TYPES = [
  'document',
  'eventsource',
  'fetch',
  'font',
  'image',
  'manifest',
  'media',
  'navigation',
  'other',
  'stylesheet',
  'script',
  'texttrack',
  'websocket',
  'xhr'
];

const STATUS_CODES = {
  2: '2xx [Success]',
  3: '3xx [Redirect]',
  4: '4xx [Request Error]',
  5: '5xx [Server Error]'
};

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
