// @flow
import { Component } from 'react';
import ReactDOM from 'react-dom';

type Props = {
  children: 'object',
  onKeydown?: 'function',
  onKeyup?: 'function',
  disabled?: 'boolean',
  scoped?: 'boolean',
  stopMetaPropagation?: 'boolean'
};

const isMac = () => process.platform === 'darwin';

class KeydownBinder extends Component<Props> {
  constructor(props) {
    super(props);

    this._handleKeydown = this._handleKeydown.bind(this);
    this._handleKeyup = this._handleKeyup.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  componentDidMount() {
    if (this.props.scoped) {
      const el = ReactDOM.findDOMNode(this);
      if (el) {
        el.addEventListener('keydown', this._handleKeydown);
        el.addEventListener('keyup', this._handleKeyup);
      }
    } else if (document.body) {
      document.body.addEventListener('keydown', this._handleKeydown);
      document.body.addEventListener('keyup', this._handleKeyup);
    }
  }

  componentWillUnmount() {
    if (this.props.scoped) {
      const el = ReactDOM.findDOMNode(this);
      if (el) {
        el.removeEventListener('keydown', this._handleKeydown);
        el.removeEventListener('keyup', this._handleKeyup);
      }
    } else if (document.body) {
      document.body.removeEventListener('keydown', this._handleKeydown);
      document.body.removeEventListener('keyup', this._handleKeyup);
    }
  }

  _handleKeydown(e: KeyboardEvent) {
    const { stopMetaPropagation, onKeydown, disabled } = this.props;

    if (disabled) {
      return;
    }

    const isMeta = isMac() ? e.metaKey : e.ctrlKey;
    if (stopMetaPropagation && isMeta) {
      e.stopPropagation();
    }

    if (onKeydown) {
      onKeydown(e);
    }
  }

  _handleKeyup(e: KeyboardEvent) {
    const { stopMetaPropagation, onKeyup, disabled } = this.props;

    if (disabled) {
      return;
    }

    const isMeta = isMac() ? e.metaKey : e.ctrlKey;
    if (stopMetaPropagation && isMeta) {
      e.stopPropagation();
    }

    if (onKeyup) {
      onKeyup(e);
    }
  }

  render() {
    return this.props.children;
  }
}

export default KeydownBinder;
