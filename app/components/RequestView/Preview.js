import React, { Component } from 'react';
import ReactDOM from 'react-dom';

type Props = {
  value: 'string'
};

export default class Preview extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.setWebViewRef = this.setWebViewRef.bind(this);
  }

  componentDidMount() {
    const contentEncoded = Buffer.from(this.props.value).toString('base64');
    const src = `data:text/html;base64,${contentEncoded}`;

    const webView = ReactDOM.findDOMNode(this.webViewRef);
    console.log('componentDidMount');

    webView.addEventListener('did-start-loading', () => {
      console.log('WebView Ready!!!');
      webView.loadURL(src, {});
    });
  }

  setWebViewRef(ref) {
    this.webViewRef = ref;
  }

  render() {
    return (
      <webview
        ref={this.setWebViewRef}
        src="data:text/html;hello world"
        style={{ display: 'inline-flex', width: '100%', height: '100%' }}
      />
    );
  }
}
