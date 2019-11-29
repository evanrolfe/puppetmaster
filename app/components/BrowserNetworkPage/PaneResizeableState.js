import React from 'react';

import { useDispatch, useSelector } from '../../state/state';
import PaneResizeable from '../pane/PaneResizeable';

type Props = {
  paneId: 'number',
  children: 'object'
};

const getPane = (state, paneId) =>
  state.browserNetworkPage.page.panes.find(pane => pane.id === paneId);

export default ({ paneId, children }: Props) => {
  const dispatch = useDispatch();

  const orientation = useSelector(
    state => state.browserNetworkPage.page.orientation
  );
  const draggingPane = useSelector(
    state => getPane(state, paneId).draggingPane
  );
  const paneLength = useSelector(state => getPane(state, paneId).length);

  const setDraggingPane = draggingPane1 => {
    dispatch({
      type: 'SET_DRAGGING_PANE',
      page: 'browserNetworkPage',
      paneId: paneId,
      draggingPane: draggingPane1
    });
  };

  const setPaneLength = length => {
    dispatch({
      type: 'SET_PANE_LENGTH',
      page: 'browserNetworkPage',
      paneId: paneId,
      length: length
    });
  };

  return (
    <PaneResizeable
      draggingPane={draggingPane}
      orientation={orientation}
      paneLength={paneLength}
      setDraggingPane={setDraggingPane}
      setPaneLength={setPaneLength}
    >
      {children}
    </PaneResizeable>
  );
};
