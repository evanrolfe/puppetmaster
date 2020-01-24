import React from 'react';

import { useSelector, useDispatch } from '../../state/state';
import RequestTab from '../RequestView/RequestTab';

export default () => {
  const request = useSelector(state => state.browserNetworkPage.request);
  const showModifiedRequest = useSelector(
    state => state.browserNetworkPage.showModifiedRequest
  );
  const dispatch = useDispatch();

  if (
    request === undefined ||
    request === null ||
    request.method === null ||
    Object.keys(request).length === 0
  )
    return null;

  const setOriginalRequest = () => {
    dispatch({
      type: 'SET_SHOW_MODIFIED_REQUEST',
      showModifiedRequest: false,
      page: 'browserNetworkPage'
    });
  };

  const setModifiedRequest = () => {
    dispatch({
      type: 'SET_SHOW_MODIFIED_REQUEST',
      showModifiedRequest: true,
      page: 'browserNetworkPage'
    });
  };

  let method;
  let url;
  let headers;
  let payload;

  if (request.request_modified === 1 && showModifiedRequest === true) {
    method = request.modified_method;
    url = request.modified_url;
    headers = JSON.parse(request.modified_request_headers);
    payload = request.modified_request_payload;
  } else {
    method = request.method;
    url = request.url;
    headers = JSON.parse(request.request_headers);
    payload = request.request_payload;
  }

  return (
    <RequestTab
      method={method}
      url={url}
      headers={headers}
      payload={payload}
      requestModified={request.request_modified}
      showModifiedRequest={showModifiedRequest}
      setOriginalRequest={setOriginalRequest}
      setModifiedRequest={setModifiedRequest}
    />
  );
};
