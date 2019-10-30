import React, { Component } from 'react';
import CodeEditor from './CodeEditor';
import Preview from './Preview';
import ViewModeDropdown from './ViewModeDropdown';
import {
  getMimeTypeFromResponse,
  canPrettify,
  prettifyCode,
  isHTML
} from '../../lib/CodeEditorUtils';

type Props = {
  request: 'object',
  codeMirrorWidth: 'number'
};

export default class BodyTab extends Component<Props> {
  constructor(props) {
    super(props);

    this.state = {
      viewMode: 'pretty', // pretty | raw | preview | parsed
      viewContent: 'render' // source | render
    };

    this.showEditor = this.showEditor.bind(this);
    this.openInBrowser = this.openInBrowser.bind(this);
    this.selectDropdownItem = this.selectDropdownItem.bind(this);
  }

  selectDropdownItem(args) {
    const viewMode = args[0];
    const viewContent = args[1];

    this.setState({ viewMode: viewMode, viewContent: viewContent });
  }

  showEditor() {
    return this.state.viewMode !== 'preview';
  }

  showPreview() {
    return !this.showEditor();
  }

  openInBrowser() {
    const content = this.props.request.response_body || '';
    const contentEncoded = Buffer.from(content).toString('base64');
    global.backendConn.send('BrowsersController', 'create', {
      contentEncoded: contentEncoded
    });
  }

  render() {
    if (Object.entries(this.props.request).length === 0) return <></>;

    let code = this.props.request.response_body || '';
    let mimeType;
    if (this.props.request.request_type === 'navigation') {
      // Navigation requests are always HTML:
      mimeType = 'text/html';
    } else {
      mimeType = getMimeTypeFromResponse(
        code,
        this.props.request.response_headers
      );
    }

    if (this.state.viewMode === 'pretty' && canPrettify(mimeType)) {
      code = prettifyCode(code, mimeType);
    }

    /*
     *  Request Body Types:
     *    request-html: an HTTP request made for an HTML document page which is rendered by the browser
     *    navigation-html: when the browsers url changes based on javascript parsing (i.e. in an SPA)
     *    request: a request for a non-html item i.e. css,js,images etc.
     */
    let bodyType;
    if (isHTML(mimeType)) {
      if (this.props.request.request_type === 'navigation') {
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
    let normalisedViewContent = this.state.viewContent;
    if (bodyType === 'navigation-html' && normalisedViewContent === 'source') {
      normalisedViewContent = 'render';
    } else if (
      bodyType === 'request-other' &&
      normalisedViewContent === 'render'
    ) {
      normalisedViewContent = 'source';
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
              viewMode={this.state.viewMode}
              viewContent={normalisedViewContent}
              bodyType={bodyType}
              selectDropdownItem={this.selectDropdownItem}
            />

            {isHTML(mimeType) && (
              <button
                className="pointer btn btn--outlined btn--super-compact"
                style={{ marginLeft: '10px', display: 'inline-block' }}
                onClick={this.openInBrowser}
              >
                Open in Browser
              </button>
            )}
          </div>
        </div>

        <div
          className="pane-remaining"
          style={{ width: `${this.props.codeMirrorWidth}px` }}
        >
          {this.showPreview() && (
            <Preview value={code} request={this.props.request} />
          )}
          {this.showEditor() && <CodeEditor value={code} mimeType={mimeType} />}
        </div>
      </>
    );
  }
}
