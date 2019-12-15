import React from 'react';

import { useSelector } from '../../state/state';
import RequestsTable from '../RequestsTable';

export default () => {
  const selectedRequestId = useSelector(
    state => state.browserNetworkPage.selectedRequestId
  );
  const selectedRequestId2 = useSelector(
    state => state.browserNetworkPage.selectedRequestId2
  );
  const requests = useSelector(state => state.browserNetworkPage.requests);
  const orderBy = useSelector(state => state.browserNetworkPage.orderBy);
  const dir = useSelector(state => state.browserNetworkPage.dir);
  const requestsTableColumns = useSelector(
    state => state.browserNetworkPage.requestsTableColumns
  );

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
