import React, { Component } from 'react';
import Modal from './Modal';
import ModalBody from './ModalBody';
import ModalHeader from './ModalHeader';
import ModalFooter from './ModalFooter';

const DEFAULT_FILTERS = {
  hostList: [],
  hostSetting: '',
  pathList: [],
  pathSetting: '',
  extList: [],
  extSetting: '',
  resourceTypes: []
};

export default class CaptureFiltersModal extends Component {
  constructor(props) {
    super(props);

    this.state = { filters: DEFAULT_FILTERS };

    this.textareas = [];

    this._setModalRef = this._setModalRef.bind(this);
    this._handleChangeListTextArea = this._handleChangeListTextArea.bind(this);
    this._handleChangeListInput = this._handleChangeListInput.bind(this);
    this._handleChangeSetting = this._handleChangeSetting.bind(this);
    this._handleApply = this._handleApply.bind(this);
    this._handleResourceTypeChange = this._handleResourceTypeChange.bind(this);
    this.onHide = this.onHide.bind(this);
    this.toggleAllResourceTypes = this.toggleAllResourceTypes.bind(this);
  }

  componentDidMount() {
    this.loadFilters();
  }

  async loadFilters() {
    const response = await global.backendConn.send(
      'CaptureFiltersController',
      'show',
      {}
    );
    const filters = response.result.body;
    console.log(`Loaded filters: ${JSON.stringify(filters)}`);
    this.setState({ filters: response.result.body });
  }

  _setModalRef(n) {
    this.modal = n;
  }

  show() {
    this.modal.show();
  }

  // Used for hostList, pathList
  _handleChangeListTextArea(event) {
    const listStr = event.target.value;
    const listArr = listStr.split('\n');
    const filterName = event.target.name;

    this.setState(prevState => {
      const newFilters = JSON.parse(JSON.stringify(prevState.filters));
      newFilters[filterName] = listArr;
      return { filters: newFilters };
    });
  }

  _handleChangeListInput(event) {
    const listStr = event.target.value;
    const listArr = listStr.split(',');
    const filterName = event.target.name;

    this.setState(prevState => {
      const newFilters = JSON.parse(JSON.stringify(prevState.filters));
      newFilters[filterName] = listArr;
      return { filters: newFilters };
    });
  }

  // Use for hostSetting, pathSetting
  _handleChangeSetting(event) {
    const value = event.target.value;
    const settingName = event.target.name;

    this.setState(prevState => {
      const newFilters = JSON.parse(JSON.stringify(prevState.filters));
      newFilters[settingName] = value;
      return { filters: newFilters };
    });
  }

  _handleResourceTypeChange(event) {
    const value = event.target.value;
    const checked = event.target.checked;

    this.setState(prevState => {
      const newFilters = JSON.parse(JSON.stringify(prevState.filters));

      if (checked) {
        if (!newFilters.resourceTypes.includes(value)) {
          newFilters.resourceTypes.push(value);
        }
      } else {
        newFilters.resourceTypes = newFilters.resourceTypes.filter(
          type => type !== value
        );
      }

      return { filters: newFilters };
    });
  }

  onHide() {
    this.loadFilters(); // Reset to original filters from the database
  }

  _handleApply() {
    global.backendConn.send(
      'CaptureFiltersController',
      'update',
      this.state.filters
    );
    this.modal.hide(true);
  }

  toggleAllResourceTypes() {
    this.setState(prevState => {
      const newFilters = JSON.parse(JSON.stringify(prevState.filters));

      if (
        prevState.filters.resourceTypes.length ===
        this.props.allResourceTypes.length
      ) {
        // Uncheck all
        newFilters.resourceTypes = [];
      } else {
        // Check all
        newFilters.resourceTypes = this.props.allResourceTypes;
      }

      return { filters: newFilters };
    });
  }

  displayResourceTypeCheckbox(type) {
    return (
      <label style={{ verticalAlign: 'top' }}>
        {type}
        <input
          type="checkbox"
          value={type}
          checked={this.state.filters.resourceTypes.includes(type)}
          onChange={this._handleResourceTypeChange}
        />
      </label>
    );
  }

  render() {
    return (
      <Modal
        ref={this._setModalRef}
        tall
        freshState
        onHide={this.onHide}
        {...this.props}
      >
        <ModalHeader>Capture Filters</ModalHeader>

        <ModalBody>
          <div className="pad">
            <div className="row-fill row-fill--top">
              <div className="form-control form-control--outlined">
                <label>
                  Host
                  <select
                    name="hostSetting"
                    value={this.state.filters.hostSetting}
                    onChange={this._handleChangeSetting}
                  >
                    <option value="">No filter</option>
                    <option value="include">Includes:</option>
                    <option value="exclude">Does not include:</option>
                  </select>
                </label>
              </div>

              <div className="form-control form-control--outlined">
                <label>
                  Values:
                  <textarea
                    className="filterList"
                    name="hostList"
                    placeholder="example.com"
                    value={this.state.filters.hostList.join('\n')}
                    onChange={this._handleChangeListTextArea}
                    disabled={this.state.filters.hostSetting === ''}
                  />
                </label>
              </div>
            </div>

            <div className="row-fill row-fill--top">
              <div className="form-control form-control--outlined">
                <label>
                  Path
                  <select
                    name="pathSetting"
                    value={this.state.filters.pathSetting}
                    onChange={this._handleChangeSetting}
                  >
                    <option value="">No filter</option>
                    <option value="include">Includes segment:</option>
                    <option value="exclude">Does not include segment:</option>
                  </select>
                </label>
              </div>

              <div className="form-control form-control--outlined">
                <label>
                  Values:
                  <textarea
                    className="filterList"
                    name="pathList"
                    placeholder="/api/v2/"
                    value={this.state.filters.pathList.join('\n')}
                    onChange={this._handleChangeListTextArea}
                    disabled={this.state.filters.pathSetting === ''}
                  />
                </label>
              </div>
            </div>

            <div className="row-fill row-fill--top">
              <div className="form-control form-control--outlined">
                <label>
                  File Extension
                  <select
                    name="extSetting"
                    value={this.state.filters.extSetting}
                    onChange={this._handleChangeSetting}
                  >
                    <option value="">No filter</option>
                    <option value="include">Includes:</option>
                    <option value="exclude">Excludes:</option>
                  </select>
                </label>
              </div>

              <div className="form-control form-control--outlined">
                <label>
                  Values:
                  <input
                    name="extList"
                    type="text"
                    placeholder="css,js,html,json"
                    value={this.state.filters.extList.join(',')}
                    onChange={this._handleChangeListInput}
                    disabled={this.state.filters.extSetting === ''}
                  />
                </label>
              </div>
            </div>

            <div className="row-fill row-fill--top">
              <div
                className="form-control form-control--thin"
                style={{ width: '50%', paddingRight: '6px' }}
              >
                <strong>Resource Type: </strong>
                <span onClick={this.toggleAllResourceTypes}>(toggle all)</span>

                <div className="row-fill">
                  <div>
                    {this.props.allResourceTypes
                      .slice(0, 5)
                      .map(type => this.displayResourceTypeCheckbox(type))}
                  </div>
                  <div>
                    {this.props.allResourceTypes
                      .slice(5, 10)
                      .map(type => this.displayResourceTypeCheckbox(type))}
                  </div>
                  <div
                    style={{ display: 'inline-block', verticalAlign: 'top' }}
                  >
                    {this.props.allResourceTypes
                      .slice(10, this.props.allResourceTypes.length)
                      .map(type => this.displayResourceTypeCheckbox(type))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <div>
            <button
              className="pointer btn btn--outlined btn--compact btn--modal-ok"
              style={{ borderColor: '#528D95' }}
              onClick={this._handleApply}
            >
              Apply
            </button>
          </div>
        </ModalFooter>
      </Modal>
    );
  }
}
