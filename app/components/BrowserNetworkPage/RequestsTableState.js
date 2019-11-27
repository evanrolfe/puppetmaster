import React from 'react';

import { useTrackedState } from '../../state/state';
import RequestsTable from '../RequestsTable';

export default () => {
  const state = useTrackedState();

  const {
    requests,
    requestsTableColumns,
    selectedRequestId,
    selectedRequestId2,
    orderBy,
    dir
  } = state;

  return (
    <RequestsTable
      requests={requests}
      requestsTableColumns={requestsTableColumns}
      selectedRequestId={selectedRequestId}
      selectedRequestId2={selectedRequestId2}
      orderBy={orderBy}
      dir={dir}
    />
  );
};
