import React, { Component } from 'react';
import Modal from './Modal';
import ModalBody from './ModalBody';
import ModalHeader from './ModalHeader';
import ModalFooter from './ModalFooter';

type Props = {
  saveBrowserTitle: 'function',
  browser: 'object'
};

export default class EditBrowserModal extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);

    this.state = { browserTitle: props.browser.title };

    this._setModalRef = this._setModalRef.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this._handleSave = this._handleSave.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this.onHide = this.onHide.bind(this);
    this.onShow = this.onShow.bind(this);
    this.inputRef = React.createRef();
  }

  _setModalRef(n) {
    this.modal = n;
  }

  show() {
    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }

  onHide() {
    this.setState({ browserTitle: this.props.browser.title });
  }

  onShow() {
    this.inputRef.current.focus();
  }

  _handleSave() {
    this.props.saveBrowserTitle(this.props.browser.id, this.state.browserTitle);
    this.modal.hide(true);
  }

  _handleChange(event) {
    this.setState({ browserTitle: event.target.value });
  }

  render() {
    return (
      <form onSubmit={this._handleSave}>
        <Modal
          ref={this._setModalRef}
          onHide={this.onHide}
          onShow={this.onShow}
          thin
          freshState
          dontFocus
        >
          <ModalHeader>Editing Browser:</ModalHeader>
          <ModalBody noScroll>
            <div className="pad">
              <div className="row-fill row-fill--top">
                <div className="form-control form-control--outlined">
                  <label>
                    Title:
                    <input
                      ref={this.inputRef}
                      name="title"
                      type="text"
                      onChange={this._handleChange}
                      value={this.state.browserTitle}
                    />
                  </label>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div>
              <button
                className="pointer btn btn--outlined btn--compact btn--modal-ok"
                style={{ borderColor: '#528D95' }}
                onClick={this._handleSave}
              >
                Save
              </button>
            </div>
          </ModalFooter>
        </Modal>
      </form>
    );
  }
}
