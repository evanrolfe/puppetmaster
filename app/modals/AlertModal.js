import React, { Component } from 'react';
import Modal from '../components/modals/Modal';
import ModalBody from '../components/modals/ModalBody';
import ModalHeader from '../components/modals/ModalHeader';
import ModalFooter from '../components/modals/ModalFooter';

class AlertModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      message: '',
      addCancel: false
    };

    this._setModalRef = this._setModalRef.bind(this);
    this._handleOk = this._handleOk.bind(this);
    this.hide = this.hide.bind(this);
    this.setCancelRef = this.setCancelRef.bind(this);
    this.setOkRef = this.setOkRef.bind(this);
    this.show = this.show.bind(this);
  }

  _setModalRef(m) {
    this.modal = m;
  }

  _handleOk() {
    this.hide();
    this._okCallback();
  }

  hide() {
    this.modal.hide();
  }

  setCancelRef(n) {
    this._cancel = n;
  }

  setOkRef(n) {
    this._ok = n;
  }

  show(options = {}) {
    const { title, message, addCancel } = options;
    this.setState({ title, message, addCancel });

    this.modal.show();

    // Need to do this after render because modal focuses itself too
    setTimeout(() => {
      if (this._cancel) {
        this._cancel.focus();
      }
    }, 100);

    return new Promise(resolve => {
      this._okCallback = resolve;
    });
  }

  render() {
    const { message, title, addCancel } = this.state;

    return (
      <Modal ref={this._setModalRef} closeOnKeyCodes={[13]}>
        <ModalHeader>{title || 'Uh Oh!'}</ModalHeader>
        <ModalBody className="wide pad">{message}</ModalBody>
        <ModalFooter>
          <div>
            {addCancel ? (
              <button
                className="btn"
                ref={this.setCancelRef}
                onClick={this.hide}
              >
                Cancel
              </button>
            ) : null}
            <button
              className="btn"
              ref={this.setOkRef}
              onClick={this._handleOk}
            >
              Ok
            </button>
          </div>
        </ModalFooter>
      </Modal>
    );
  }
}

export default AlertModal;
