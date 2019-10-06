import React, { Component } from 'react';
import Modal from './Modal';
import ModalBody from './ModalBody';
import ModalHeader from './ModalHeader';

export const TAB_INDEX_EXPORT = 1;
export const TAB_INDEX_SHORTCUTS = 3;

export default class DisplayFiltersModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this._setModalRef = this._setModalRef.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
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

  render() {
    const resourceTypes = [
      'document',
      'fetch',
      'manifest',
      'other',
      'script',
      'stylesheet',
      'xhr'
    ];
    const statusCodes = [
      '2xx [Success]',
      '3xx [Redirect]',
      '4xx [Request Error]',
      '5xx [Server Error]'
    ];

    return (
      <Modal ref={this._setModalRef} tall freshState {...this.props}>
        <ModalHeader>Display Filters</ModalHeader>
        <ModalBody noScroll>
          <div className="pad scrollable">
            <div className="row-fill row-fill--top">
              <div className="form-control form-control--outlined">
                <label>
                  Host
                  <select name="hostOperator">
                    <option value={1}>No filter</option>
                    <option value={1}>Matches:</option>
                    <option value={2}>Does not match:</option>
                  </select>
                </label>
              </div>

              <div className="form-control form-control--outlined">
                <label>
                  Value:
                  <input type="text" />
                </label>
              </div>
            </div>

            <div className="row-fill row-fill--top">
              <div className="form-control form-control--outlined">
                <label>
                  Path
                  <select name="hostOperator">
                    <option value={1}>No filter</option>
                    <option value={1}>Matches:</option>
                    <option value={2}>Does not match:</option>
                  </select>
                </label>
              </div>

              <div className="form-control form-control--outlined">
                <label>
                  Value:
                  <input type="text" />
                </label>
              </div>
            </div>

            <div className="row-fill row-fill--top">
              <div className="form-control form-control--thin">
                <strong>Status Code</strong>

                {statusCodes.map(status => (
                  <label>
                    {status} <input type="checkbox" />
                  </label>
                ))}
              </div>

              <div className="form-control form-control--thin">
                <strong>Resource Type</strong>

                {resourceTypes.map(type => (
                  <label>
                    {type} <input type="checkbox" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}
