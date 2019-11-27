import React, { useEffect } from 'react';
import { remote } from 'electron';
import _ from 'lodash';

import { useDispatch, useSelector } from '../../state/state';
import BrowserTabs from '../BrowserTabs';
import RequestsTableState from '../BrowserNetworkPage/RequestsTableState';
import RequestViewState from '../BrowserNetworkPage/RequestViewState';
import RequestsFilterFormState from '../BrowserNetworkPage/RequestsFilterFormState';

const MIN_PANE_WIDTH = 300;
const MIN_PANE_HEIGHT = 175;

export const RESOURCE_TYPES = [
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

export const STATUS_CODES = {
  2: '2xx [Success]',
  3: '3xx [Redirect]',
  4: '4xx [Request Error]',
  5: '5xx [Server Error]'
};

const getPaneStyle = (orientation, paneWidth, paneHeight) => {
  const paneStyle = {};
  if (orientation === 'horizontal') {
    paneStyle.height = paneHeight;
  } else if (orientation === 'vertical') {
    paneStyle.width = paneWidth;
  }
  return paneStyle;
};

const setPaneDragHeightDOM = (event, borderDiv, paneDiv) => {
  const diff = event.clientX - borderDiv.offsetLeft - borderDiv.offsetWidth;
  const newWidth = paneDiv.clientWidth + diff;

  if (newWidth < MIN_PANE_WIDTH) return;
  paneDiv.style.width = `${newWidth}px`;
};

const setPaneDragWidthDOM = (event, borderDiv, paneDiv) => {
  const diff = event.clientY - borderDiv.offsetTop - borderDiv.offsetHeight;
  const newHeight = paneDiv.clientHeight + diff;

  if (newHeight < MIN_PANE_HEIGHT) return;
  paneDiv.style.height = `${newHeight}px`;
};

export default ({ history, location }) => {
  console.log(`[RENDER] BrowserNetworkPage`);

  const dispatch = useDispatch();

  const draggingPane = useSelector(
    state => state.browserNetworkPage.draggingPane
  );
  const orientation = useSelector(
    state => state.browserNetworkPage.orientation
  );
  const paneWidth = useSelector(state => state.browserNetworkPage.paneWidth);
  const paneHeight = useSelector(state => state.browserNetworkPage.paneHeight);

  const inverseOrientation =
    orientation === 'vertical' ? 'horizontal' : 'vertical';
  const paneStyle = getPaneStyle(orientation, paneWidth, paneHeight);

  const borderDivRef = React.createRef();
  const paneDivRef = React.createRef();

  const loadRequests = () => dispatch({ type: 'LOAD_REQUESTS' });
  loadRequests();
  dispatch({ type: 'LOAD_BROWSERS' });

  global.backendConn.listen('requestCreated', () => {
    loadRequests();
  });
  global.backendConn.listen('browsersChanged', () => {
    loadRequests();
  });

  const _handleMouseUp = () => {
    const paneDiv = paneDivRef.current;

    if (draggingPane === true) {
      dispatch({
        type: 'SET_DRAGGING_PANE',
        draggingPane: false,
        page: 'browserNetworkPage'
      });

      if (orientation === 'vertical') {
        dispatch({
          type: 'SET_PANE_WIDTH_STORAGE',
          width: paneDiv.clientWidth
        });
      } else if (orientation === 'horizontal') {
        dispatch({
          type: 'SET_PANE_HEIGHT_STORAGE',
          height: paneDiv.clientHeight
        });
      }
    }
  };

  const _handleMouseMove = e => {
    if (draggingPane === true) {
      const borderDiv = borderDivRef.current;
      const paneDiv = paneDivRef.current;

      if (orientation === 'vertical')
        setPaneDragHeightDOM(e, borderDiv, paneDiv);
      if (orientation === 'horizontal')
        setPaneDragWidthDOM(e, borderDiv, paneDiv);
    }
  };

  const _setWindowSize = () => {
    const size = remote.getCurrentWindow().getSize();
    dispatch({ type: 'SET_WINDOW_SIZE_THROTTLED', windowSize: size });
  };
  const _setWindowSizeThrottled = _.throttle(_setWindowSize, 250);

  _setWindowSize();

  useEffect(
    () => {
      document.addEventListener('mouseup', _handleMouseUp);
      document.addEventListener('mousemove', _handleMouseMove);
      window.addEventListener('resize', _setWindowSizeThrottled);

      return () => {
        document.removeEventListener('mouseup', _handleMouseUp);
        document.removeEventListener('mousemove', _handleMouseMove);
        window.removeEventListener('resize', _setWindowSizeThrottled);
      };
    },
    [_handleMouseUp, _handleMouseMove]
  );

  return (
    <>
      <div className={`pane-container-${inverseOrientation}`}>
        <div
          className="pane-fixed pane-container-vertical"
          style={paneStyle}
          ref={paneDivRef}
        >
          <div className="pane-fixed">
            <BrowserTabs history={history} location={location} />
          </div>

          <div
            className="pane-fixed"
            style={{ marginLeft: '10px', padding: '6px' }}
          >
            <RequestsFilterFormState />
          </div>

          <RequestsTableState />
        </div>

        <div
          className="pane-border pane-fixed"
          onMouseDown={() =>
            dispatch({
              type: 'SET_DRAGGING_PANE',
              draggingPane: true,
              page: 'browserNetworkPage'
            })
          }
          ref={borderDivRef}
        >
          <div className="pane-border-transparent" />
        </div>

        <RequestViewState />
      </div>
    </>
  );
};
