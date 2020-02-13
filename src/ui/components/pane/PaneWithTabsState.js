import React from 'react';

import { useDispatch, useSelector } from '../../state/state';
import { getPane } from '../../state/selectors';
import PaneWithTabs from './PaneWithTabs';

type Props = {
  tabs: 'array',
  children: 'object',
  paneId: 'number',
  pageName: 'string'
};

export default ({ paneId, pageName, tabs, children }: Props) => {
  const dispatch = useDispatch();

  const tabIndex = useSelector(
    state => getPane(state, paneId, pageName).tabIndex
  );

  const setTabIndex = i => {
    console.log(`Setting tab index: ${i}`);
    dispatch({
      type: 'SET_PANE_TABINDEX',
      tabIndex: i,
      page: pageName,
      paneId: paneId
    });
  };

  return (
    <PaneWithTabs tabs={tabs} tabIndex={tabIndex} setTabIndex={setTabIndex}>
      {children}
    </PaneWithTabs>
  );
};
