import React from 'react';
import { useDispatch, useSelector } from '../../state/state';

import CodeEditor from './CodeEditor';
import Preview from './Preview';
import ViewModeDropdown from './ViewModeDropdown';
import {
  getMimeTypeFromResponse,
  canPrettify,
  prettifyCode,
  isHTML
} from '../../lib/CodeEditorUtils';

export default ({ request, codeMirrorWidth }) => {
  console.log(`[RENDER] BodyTab`);

  const dispatch = useDispatch();

  const viewMode = useSelector(state => state.browserNetworkPage.viewMode);
  const viewContent = useSelector(
    state => state.browserNetworkPage.viewContent
  );

  const selectDropdownItem = args => {
    dispatch({
      type: 'SET_BODYTAB_VIEW',
      viewMode: args[0],
      viewContent: args[1],
      page: 'browserNetworkPage'
    });
  };

  const openInBrowser = () => {
    const content = request.response_body || '';
    const contentEncoded = Buffer.from(content).toString('base64');
    global.backendConn.send('BrowsersController', 'create', {
      contentEncoded: contentEncoded
    });
  };

  if (request === null || Object.entries(request).length === 0) return <></>;

  let mimeType;
  if (request.request_type === 'navigation') {
    // Navigation requests are always HTML:
    mimeType = 'text/html';
  } else {
    mimeType = getMimeTypeFromResponse(request.response_headers);
  }

  /*
   *  Request Body Types:
   *    request-html: an HTTP request made for an HTML document page which is rendered by the browser
   *    navigation-html: when the browsers url changes based on javascript parsing (i.e. in an SPA)
   *    request: a request for a non-html item i.e. css,js,images etc.
   */
  let bodyType;
  if (isHTML(mimeType)) {
    if (request.request_type === 'navigation') {
      bodyType = 'navigation-html';
    } else {
      bodyType = 'request-html';
    }
  } else {
    bodyType = 'request-other';
  }

  /*
   *  Normalised viewContent behaviour:
   *    request-html can display source & render
   *    navigation-html can display only render
   *    request-other can display only source
   *    So if a contentType is selected that we can't display, then we need to pick something else:
   */
  let normalisedViewContent = viewContent;
  if (bodyType === 'navigation-html' && normalisedViewContent === 'source') {
    normalisedViewContent = 'render';
  } else if (
    bodyType === 'request-other' &&
    normalisedViewContent === 'render'
  ) {
    normalisedViewContent = 'source';
  }

  /*
   *  Normalised viewMode behaviour:
   *    request-html can display raw,pretty,preview
   *    navigation-html can display raw,pretty,preview
   *    request-other can display raw,pretty
   */
  let normalisedViewMode = viewMode;
  if (normalisedViewMode === 'preview' && bodyType === 'request-other') {
    normalisedViewMode = 'pretty';
  }

  let canPreview = true;
  if (bodyType === 'request-other') canPreview = false;

  const showEditor = normalisedViewMode !== 'preview';
  const showPreview = !showEditor;

  /*
   *  Code Behaviour:
   *    Use ...
   */
  let code;
  if (normalisedViewContent === 'render') {
    code = request.response_body_rendered || '';
  } else {
    code = request.response_body || '';
  }

  if (normalisedViewMode === 'pretty' && canPrettify(mimeType)) {
    code = prettifyCode(code, mimeType);
  }

  return (
    <>
      <div
        className="pane-fixed code-editor-controls"
        style={{ padding: '6px' }}
      >
        <div
          className="form-control form-control--outlined"
          style={{ display: 'inline-block' }}
        >
          <label style={{ marginLeft: '10px' }}>View as:</label>

          <ViewModeDropdown
            viewMode={normalisedViewMode}
            viewContent={normalisedViewContent}
            bodyType={bodyType}
            canPreview={canPreview}
            selectDropdownItem={selectDropdownItem}
          />

          {isHTML(mimeType) && (
            <button
              className="pointer btn btn--outlined btn--super-compact"
              style={{ marginLeft: '10px', display: 'inline-block' }}
              onClick={openInBrowser}
            >
              Show in Browser
            </button>
          )}
        </div>
      </div>

      <div className="pane-remaining" style={{ width: `${codeMirrorWidth}px` }}>
        {showPreview && <Preview value={code} request={request} />}
        {showEditor && <CodeEditor value={code} mimeType={mimeType} />}
      </div>
    </>
  );
};
