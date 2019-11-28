import React from 'react';

import { useDispatch, useSelector } from '../../state/state';
import PaneWithTabs from '../pane/PaneWithTabs';

type Props = {
  tabs: 'array',
  children: 'object'
};

export default ({ tabs, children }: Props) => {
  const dispatch = useDispatch();

  const tabIndex = useSelector(
    state => state.browserNetworkPage.requestViewTabIndex
  );

  const setTabIndex = i => {
    console.log(`Setting tab index: ${i}`);
    dispatch({
      type: 'SET_TABINDEX',
      requestViewTabIndex: i,
      page: 'browserNetworkPage'
    });
  };

  return (
    <PaneWithTabs tabs={tabs} tabIndex={tabIndex} setTabIndex={setTabIndex}>
      {children}
    </PaneWithTabs>
  );
};
