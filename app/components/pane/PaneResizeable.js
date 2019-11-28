import React, { useEffect } from 'react';
import PaneFixed from './PaneFixed';
import { useDispatch, useSelector } from '../../state/state';

const MIN_PANE_WIDTH = 300;
const MIN_PANE_HEIGHT = 175;

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

export default props => {
  const dispatch = useDispatch();

  const draggingPane = useSelector(
    state => state.browserNetworkPage.draggingPane
  );
  const orientation = useSelector(
    state => state.browserNetworkPage.orientation
  );
  const paneWidth = useSelector(state => state.browserNetworkPage.paneWidth);
  const paneHeight = useSelector(state => state.browserNetworkPage.paneHeight);

  const paneStyle = getPaneStyle(orientation, paneWidth, paneHeight);
  const borderDivRef = React.createRef();
  const paneDivRef = React.createRef();

  const _startDragging = () => {
    dispatch({
      type: 'SET_DRAGGING_PANE',
      draggingPane: true,
      page: 'browserNetworkPage'
    });
  };

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

  useEffect(
    () => {
      document.addEventListener('mouseup', _handleMouseUp);
      document.addEventListener('mousemove', _handleMouseMove);

      return () => {
        document.removeEventListener('mouseup', _handleMouseUp);
        document.removeEventListener('mousemove', _handleMouseMove);
      };
    },
    [_handleMouseUp, _handleMouseMove]
  );

  return (
    <>
      <PaneFixed style={paneStyle} ref={paneDivRef}>
        {props.children}
      </PaneFixed>

      <PaneFixed
        className="pane-border"
        onMouseDown={_startDragging}
        ref={borderDivRef}
      >
        <div className="pane-border-transparent" />
      </PaneFixed>
    </>
  );
};
