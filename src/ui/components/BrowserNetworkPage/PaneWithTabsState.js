import React from 'react';

import { useDispatch, useSelector } from '../../state/state';
import { getPane } from '../../state/selectors';
import PaneWithTabs from '../pane/PaneWithTabs';

type Props = {
  tabs: 'array',
  children: 'object',
  paneId: 'number'
};

export default ({ paneId, tabs, children }: Props) => {
  const dispatch = useDispatch();

  const tabIndex = useSelector(state => getPane(state, paneId).tabIndex);

  const setTabIndex = i => {
    console.log(`Setting tab index: ${i}`);
    dispatch({
      type: 'SET_PANE_TABINDEX',
      tabIndex: i,
      page: 'browserNetworkPage',
      paneId: paneId
    });
  };

  return (
    <PaneWithTabs tabs={tabs} tabIndex={tabIndex} setTabIndex={setTabIndex}>
      {children}
    </PaneWithTabs>
  );
};
