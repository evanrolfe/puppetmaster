import React from 'react';

import { useSelector } from '../../state/state';
import RequestTab from '../RequestView/RequestTab';

export default () => {
  const request = useSelector(state => state.browserNetworkPage.request);

  return <RequestTab request={request} />;
};
