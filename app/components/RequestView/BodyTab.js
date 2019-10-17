import React, { Component } from 'react';
import CodeEditor from './CodeEditor';
import ViewModeDropdown from './ViewModeDropdown';
import { getContentTypeFromResponse } from '../../lib/CodeEditorUtils';

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
    console.log(`Setting viewMode to ${viewMode}`);
    this.setState({ viewMode: viewMode });
  }

  render() {
    if (Object.entries(this.props.request).length === 0) return <></>;

    const code = this.props.request.response_body || '';
    const codeMode = getContentTypeFromResponse(
      code,
      this.props.request.response_headers
    );

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
          <CodeEditor
            value={this.props.request.response_body}
            mode={codeMode}
          />
        </div>
      </>
    );
  }
}
