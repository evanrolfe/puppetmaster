import React from 'react';
import { ipcRenderer } from 'electron';
import { getUntrackedObject } from 'react-tracked';

import { useSelector, useTrackedState } from '../../../state/state';
import { getSelectedRequestIds } from '../../../state/selectors';
import RequestsTable from './RequestsTable/RequestsTable';

export default () => {
  const trackedState = useTrackedState();
  const untrackedState = getUntrackedObject(trackedState);

  // Tracked state vars:
  useSelector(state => state.browserNetworkPage.requests.length);
  const requests = useSelector(state => state.browserNetworkPage.requests);
  const requestsTableColumns = useSelector(
    state => state.browserNetworkPage.requestsTableColumns
  );

  // Untracked state vars:
  const orderBy = untrackedState.browserNetworkPage.orderBy;
  const dir = untrackedState.browserNetworkPage.dir;
  const selectedRequestId = untrackedState.browserNetworkPage.selectedRequestId;
  const selectedRequestId2 =
    untrackedState.browserNetworkPage.selectedRequestId2;

  // This will create the context menus for the multiple requests selection
  const selectedRequestIds = useSelector(state => getSelectedRequestIds(state));

  if (selectedRequestIds.length > 1) {
    console.log(
      `[Frontend] Create context menu for multiple requests (${selectedRequestIds.length})`
    );
    ipcRenderer.send('requestsSelected', {
      requestIds: selectedRequestIds
    });
  }

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
