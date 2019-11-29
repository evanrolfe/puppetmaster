import React, { useEffect } from 'react';
import PaneFixed from './PaneFixed';

const MIN_PANE_WIDTH = 300;
const MIN_PANE_HEIGHT = 175;

const getPaneStyle = (orientation, paneLength) => {
  const paneStyle = {};
  if (orientation === 'horizontal') {
    paneStyle.height = paneLength;
  } else if (orientation === 'vertical') {
    paneStyle.width = paneLength;
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

export default ({
  children,
  draggingPane,
  orientation,
  paneLength,
  setDraggingPane,
  setPaneLength
}) => {
  const paneStyle = getPaneStyle(orientation, paneLength);
  const borderDivRef = React.createRef();
  const paneDivRef = React.createRef();

  const _handleMouseUp = () => {
    const paneDiv = paneDivRef.current;

    if (draggingPane === true) {
      setDraggingPane(false);

      if (orientation === 'vertical') {
        setPaneLength(paneDiv.clientWidth);
      } else if (orientation === 'horizontal') {
        setPaneLength(paneDiv.clientHeight);
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
        {children}
      </PaneFixed>

      <PaneFixed
        className="pane-border"
        onMouseDown={() => setDraggingPane(true)}
        ref={borderDivRef}
      >
        <div className="pane-border-transparent" />
      </PaneFixed>
    </>
  );
};
