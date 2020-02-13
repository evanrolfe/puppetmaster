import React, { Component } from 'react';

type Props = {
  value: 'string',
  // eslint-disable-next-line react/no-unused-prop-types
  request: 'object'
};

export default class Preview extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);

    this.setWebViewRef = this.setWebViewRef.bind(this);
    this._handleDOMReady = this._handleDOMReady.bind(this);
    this._setBody = this._setBody.bind(this);
  }

  componentDidMount() {
    this.webViewRef.addEventListener('dom-ready', this._handleDOMReady);
  }

  componentDidUpdate() {
    this._setBody();
  }

  _handleDOMReady() {
    this.webViewRef.removeEventListener('dom-ready', this._handleDOMReady);
    this._setBody();
  }

  _setBody() {
    const content = this.props.value;

    // TODO: Why does adding this option in not work?
    // {baseURLForDataURL: 'http://localhost:3001/'}
    // See: https://github.com/electron/electron/issues/20700
    this.webViewRef.loadURL(
      `data:text/html; charset=UTF-8,${encodeURIComponent(content)}`
    );
  }

  setWebViewRef(ref) {
    this.webViewRef = ref;
  }

  render() {
    return (
      <webview
        ref={this.setWebViewRef}
        src="about:blank"
        style={{ display: 'inline-flex', width: '100%', height: '100%' }}
      />
    );
  }
}
