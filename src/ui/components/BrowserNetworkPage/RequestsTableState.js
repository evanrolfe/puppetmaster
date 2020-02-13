import React from 'react';
import { getUntrackedObject } from 'react-tracked';
import { useSelector, useTrackedState } from '../../state/state';
import RequestsTable from '../RequestsTable';

export default () => {
  const trackedState = useTrackedState();
  const untrackedState = getUntrackedObject(trackedState);

  // Tracked state vars:
  const selectedRequestId = useSelector(
    state => state.browserNetworkPage.selectedRequestId
  );
  const selectedRequestId2 = useSelector(
    state => state.browserNetworkPage.selectedRequestId2
  );
  useSelector(state => state.browserNetworkPage.requests.length);
  const requests = useSelector(state => state.browserNetworkPage.requests);
  const requestsTableColumns = useSelector(
    state => state.browserNetworkPage.requestsTableColumns
  );

  // Untracked state vars:
  const orderBy = untrackedState.browserNetworkPage.orderBy;
  const dir = untrackedState.browserNetworkPage.dir;

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
