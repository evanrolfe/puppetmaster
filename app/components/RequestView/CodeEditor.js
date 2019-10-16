import React, { Component } from 'react';
import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/mode/javascript/javascript';

type Props = {
  value: 'string'
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

export default class CodeEditor extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);

    this._handleInitTextarea = this._handleInitTextarea.bind(this);
    this._codemirrorSetValue = this._codemirrorSetValue.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this._codemirrorSetValue();

      setTimeout(() => {
        if (!this.codeMirror) return;
        console.log('Refreshing codemirror');
        this.codeMirror.refresh();
      }, 200);
    }
  }

  _codemirrorSetValue() {
    const code = this.props.value || '';
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
      <textarea
        ref={this._handleInitTextarea}
        value={this.props.value}
        readOnly
      />
    );
  }
}
