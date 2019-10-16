import React, { Component } from 'react';
import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/mode/javascript/javascript';

type Props = {
  request: 'object',
  codeMirrorWidth: 'number'
};

const TAB_SIZE = 2;
const BASE_CODEMIRROR_OPTIONS = {
  mode: 'javascript',
  theme: 'material',
  lineNumbers: true,
  placeholder: 'Start Typing...',
  foldGutter: true,
  autoRefresh: 2000,
  lineWrapping: true,
  scrollbarStyle: 'native',
  lint: true,
  matchBrackets: true,
  autoCloseBrackets: true,
  tabSize: TAB_SIZE,
  indentUnit: TAB_SIZE,
  hintOptions: null,
  dragDrop: true,
  viewportMargin: 30, // default 10
  selectionPointer: 'default',
  styleActiveLine: true,
  indentWithTabs: true,
  showCursorWhenSelecting: false,
  cursorScrollMargin: 12, // NOTE: This is px
  keyMap: 'default',
  // NOTE: Because the lint mode is initialized immediately, the lint gutter needs to
  //   be in the default options. DO NOT REMOVE THIS.
  gutters: ['CodeMirror-lint-markers']
};

export default class BodyTab extends Component<Props> {
  constructor(props) {
    super(props);

    this._handleInitTextarea = this._handleInitTextarea.bind(this);
    this._codemirrorSetValue = this._codemirrorSetValue.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.request.response_body !== prevProps.request.response_body) {
      this._codemirrorSetValue();

      setTimeout(() => {
        if (!this.codeMirror) return;
        console.log('Refreshing codemirror');
        this.codeMirror.refresh();
      }, 200);
    }
  }

  _codemirrorSetValue() {
    const code = this.props.request.response_body || '';
    this.codeMirror.setValue(code);
  }

  _handleInitTextarea(ref) {
    if (!ref) return;
    if (this.codeMirror) return;

    this.codeMirror = CodeMirror.fromTextArea(ref, BASE_CODEMIRROR_OPTIONS);

    this._codemirrorSetValue();

    setTimeout(() => {
      this.codeMirror.refresh();
    }, 200);

    console.log('Codemirror setup.');
  }

  render() {
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
            <label style={{ marginLeft: '10px' }}>View code as:</label>
            <button
              className="pointer btn btn--outlined btn--super-compact"
              style={{ marginLeft: '10px', display: 'inline-block' }}
            >
              Pretty
            </button>
          </div>
        </div>

        <div
          className="pane-remaining"
          style={{ width: `${this.props.codeMirrorWidth}px` }}
        >
          <textarea
            ref={this._handleInitTextarea}
            value={this.props.request.response_body}
            readOnly
          />
        </div>
      </>
    );
  }
}
