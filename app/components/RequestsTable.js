import React from 'react';
import { ipcRenderer } from 'electron';
// import { getUntrackedObject } from 'react-tracked';

import { useTrackedState, useDispatch } from '../state/state';
import KeydownBinder from './KeydownBinder';
import RequestsTableHeader from './RequestsTableHeader';
import RequestTableCell from './RequestTableCell';

const getSelectedRequestIds = (selectedId1, selectedId2, requests) => {
  const requestIds = requests.map(request => request.id);

  const i1 = requestIds.indexOf(selectedId1);
  const i2 = requestIds.indexOf(selectedId2);
  let selectedRequestIds;

  if (i2 > i1) {
    selectedRequestIds = requestIds.slice(i1, i2 + 1);
  } else {
    selectedRequestIds = requestIds.slice(i2, i1 + 1);
  }

  return selectedRequestIds;
};

export default () => {
  console.log(`[RENDER] RequestsTable`);

  const state = useTrackedState();
  // const untrackedState = getUntrackedObject(state);
  const dispatch = useDispatch();
  const {
    requests,
    requestsTableColumns,
    selectedRequestId,
    selectedRequestId2,
    orderBy,
    dir
  } = state;
  // const { requestsTableScrollTop } = untrackedState;

  const requestDivRef = React.createRef();

  const selectedRequestIds = getSelectedRequestIds(
    selectedRequestId,
    selectedRequestId2,
    requests
  );

  const _getRowClassName = requestId => {
    let isSelected = false;

    if (selectedRequestId2 === null) {
      isSelected = parseInt(requestId) === selectedRequestId;
    } else {
      isSelected = selectedRequestIds.includes(requestId);
    }

    if (isSelected) {
      return 'selected';
    }
  };

  const _handleRightClick = (requestId, event) => {
    event.preventDefault();

    if (selectedRequestId2 !== null) {
      ipcRenderer.send('showMultipleRequestContextMenu', {
        requestId: requestId
      });
    } else {
      ipcRenderer.send('showRequestContextMenu', { requestId: requestId });
    }
  };

  const _handleKeyUp = e => {
    if (e.key === 'Shift') dispatch({ type: 'SHIFT_RELEASED' });
  };

  const _handleKeyDown = e => {
    if (!['ArrowUp', 'ArrowDown', 'Shift'].includes(e.key)) return;

    e.preventDefault();
    // const requestDiv = requestDivRef.current;

    if (e.key === 'ArrowUp') {
      // dispatch({type: 'SET_SCROLLTOP', scrollTop: requestDiv.scrollTop});
      dispatch({ type: 'SELECT_PREV_REQUEST_LOAD' });
    }
    if (e.key === 'ArrowDown') {
      // dispatch({type: 'SET_SCROLLTOP', scrollTop: requestDiv.scrollTop});
      dispatch({ type: 'SELECT_NEXT_REQUEST_LOAD' });
    }
    if (e.key === 'Shift') dispatch({ type: 'SHIFT_PRESSED' });
  };

  // NOTE: This fires twice when the event is received for some reason
  ipcRenderer.on('deleteRequest', (event, args) => {
    dispatch({ type: 'DELETE_REQUEST', requestId: args.requestId });
  });

  // This will create the context menus for the multiple requests selection
  if (selectedRequestIds.length > 1) {
    console.log(`[Frontend] Create context menu for multiple requests`);
    ipcRenderer.send('requestsSelected', {
      requestIds: selectedRequestIds
    });
  }

  const classNameForTableHeader = columnName => {
    if (columnName === orderBy) return 'ordered';

    return '';
  };

  const setTableColumnWidth = (columnIndex, width) => {
    dispatch({
      type: 'SET_COLUMN_WIDTH',
      width: width,
      columnIndex: columnIndex
    });
  };

  const selectRequest = request => {
    // const requestDiv = requestDivRef.current;
    // dispatch({type: 'SET_SCROLLTOP', scrollTop: requestDiv.scrollTop});
    dispatch({ type: 'SELECT_REQUEST_LOAD', request: request });
  };
  /*
  useEffect(() => {
    console.log(`Setting scrollTop to: ${requestsTableScrollTop}`)
    const requestDiv = requestDivRef.current;
    requestDiv.scrollTop = requestsTableScrollTop;

    return () => {
      console.log(`Leaving RequestsTable - saving scrollTop to: ${requestDiv.scrollTop}`)
      dispatch({type: 'SET_SCROLLTOP', scrollTop: requestDiv.scrollTop});
    };
  }, [requestDivRef, requestsTableScrollTop]);
*/
  return (
    <KeydownBinder
      stopMetaPropagation
      onKeydown={_handleKeyDown}
      onKeyup={_handleKeyUp}
    >
      <div
        className="pane-remaining"
        style={{ overflowX: 'auto' }}
        ref={requestDivRef}
      >
        <table className="requests-table">
          <thead>
            <tr>
              {requestsTableColumns.map((column, i) => (
                <RequestsTableHeader
                  key={`RequestsTableHeader${i}`}
                  onClick={() =>
                    dispatch({
                      type: 'TOGGLE_COLUMN_ORDER_REQUESTS',
                      columnKey: column.key
                    })
                  }
                  className={classNameForTableHeader(column.key)}
                  orderDir={dir}
                  width={column.width}
                  setTableColumnWidth={setTableColumnWidth}
                  columnIndex={i}
                  minWidth={column.minWidth}
                >
                  {column.title}
                </RequestsTableHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr
                key={request.id}
                id={`requestRow${request.id}`}
                onClick={() => selectRequest(request)}
                onContextMenu={_handleRightClick.bind(this, request.id)}
                className={_getRowClassName(request.id)}
              >
                {requestsTableColumns.map(column => (
                  <RequestTableCell request={request} column={column} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </KeydownBinder>
  );
};
