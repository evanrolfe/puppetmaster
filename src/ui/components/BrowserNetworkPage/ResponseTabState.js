import React from 'react';

import { useSelector, useDispatch } from '../../state/state';
import ResponseTab from '../RequestView/ResponseTab';

export default () => {
  const request = useSelector(state => state.browserNetworkPage.request);
  const showModifiedResponse = useSelector(
    state => state.browserNetworkPage.showModifiedResponse
  );
  const dispatch = useDispatch();

  if (
    request === undefined ||
    request === null ||
    request.method === null ||
    Object.keys(request).length === 0
  )
    return null;

  const setOriginalResponse = () => {
    dispatch({
      type: 'SET_SHOW_MODIFIED_RESPONSE',
      showModifiedResponse: false,
      page: 'browserNetworkPage'
    });
  };

  const setModifiedResponse = () => {
    dispatch({
      type: 'SET_SHOW_MODIFIED_RESPONSE',
      showModifiedResponse: true,
      page: 'browserNetworkPage'
    });
  };

  let statusCode;
  let statusMessage;
  let headers;
  let body;

  if (request.response_modified === 1 && showModifiedResponse === true) {
    statusCode = request.modified_response_status;
    statusMessage = request.modified_response_status_message;
    headers = JSON.parse(request.modified_response_headers);
    body = request.modified_response_body;
  } else {
    statusCode = request.response_status;
    statusMessage = request.response_status_message;
    headers = JSON.parse(request.response_headers);
    body = request.response_body;
  }

  return (
    <ResponseTab
      responseModified={request.response_modified}
      statusCode={statusCode}
      statusMessage={statusMessage}
      headers={headers}
      body={body}
      setOriginalResponse={setOriginalResponse}
      setModifiedResponse={setModifiedResponse}
      showModifiedResponse={showModifiedResponse}
    />
  );
};
