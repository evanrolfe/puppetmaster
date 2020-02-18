import React from 'react';
import { ipcRenderer } from 'electron';

import RequestsTableRow from './RequestsTableRow';
import { useSelector } from '../../../../state/state';
import { isRequestSelected, getRequest } from '../../../../state/selectors';
/*
 * NOTE: This state component is a bit of a hack. We only use it in order to
 *       "inject" the isSelected state into the RequestsTableRow because
 *       react-virtualized does not let us pass any more data through to the
 *       rows apart from the request object itsself.
 */
type Props = {
  requestId: 'number'
};

export default (props: Props) => {
  const selectedRequestId2 = useSelector(
    state => state.browserNetworkPage.selectedRequestId2
  );
  const isSelected = useSelector(state =>
    isRequestSelected(state, props.requestId)
  );

  const request = useSelector(state => getRequest(state, props.requestId));

  const handleRightClick = event => {
    event.preventDefault();
    const requestId = request.id;

    if (selectedRequestId2 !== null) {
      ipcRenderer.send('showMultipleRequestContextMenu', {
        requestId: requestId
      });
    } else {
      ipcRenderer.send('showRequestContextMenu', { requestId: requestId });
    }
  };

  return (
    <RequestsTableRow
      {...props}
      request={request}
      isSelected={isSelected}
      handleRightClick={handleRightClick}
    />
  );
};
