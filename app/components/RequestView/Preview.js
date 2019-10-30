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

  async _setBody() {
    const content = this.props.value;
    // const contentEncoded = Buffer.from(content).toString('base64');
    const src = `data:text/html;charset=utf-8,${encodeURIComponent(content)}`;
    console.log(this.props.request.url);
    try {
      // See: https://github.com/electron/electron/issues/17526
      await this.webViewRef.loadURL(src, { baseURL: this.props.request.url });
    } catch (err) {
      console.log(err);
    }

    // this.webViewRef.webContents = this.webViewRef;
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
