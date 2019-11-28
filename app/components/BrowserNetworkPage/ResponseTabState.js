import React from 'react';

import { useSelector } from '../../state/state';
import ResponseTab from '../RequestView/ResponseTab';

export default () => {
  const request = useSelector(state => state.browserNetworkPage.request);

  return <ResponseTab request={request} />;
};
