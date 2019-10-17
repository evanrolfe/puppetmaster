import React, { Component } from 'react';
import CodeEditor from './CodeEditor';
import ViewModeDropdown from './ViewModeDropdown';
import {
  getMimeTypeFromResponse,
  canPrettify,
  prettifyCode
} from '../../lib/CodeEditorUtils';

type Props = {
  request: 'object',
  codeMirrorWidth: 'number'
};

export default class BodyTab extends Component<Props> {
  constructor(props) {
    super(props);

    this.state = { viewMode: 'pretty' }; // pretty | raw | preview | parsed

    this.setViewMode = this.setViewMode.bind(this);
  }

  setViewMode(viewMode) {
    this.setState({ viewMode: viewMode });
  }

  render() {
    if (Object.entries(this.props.request).length === 0) return <></>;

    let code = this.props.request.response_body || '';

    const mimeType = getMimeTypeFromResponse(
      code,
      this.props.request.response_headers
    );

    if (this.state.viewMode === 'pretty' && canPrettify(mimeType)) {
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
              viewMode={this.state.viewMode}
              setViewMode={this.setViewMode}
            />
          </div>
        </div>

        <div
          className="pane-remaining"
          style={{ width: `${this.props.codeMirrorWidth}px` }}
        >
          <CodeEditor value={code} mimeType={mimeType} />
        </div>
      </>
    );
  }
}
