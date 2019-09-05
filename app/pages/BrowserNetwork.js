// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { showModal } from '../components/modals/index';

import AlertModal from '../components/modals/AlertModal';
import PreferencesModal from '../components/modals/PreferencesModal';

type Props = {};

export default class BrowserNetwork extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);

    this.showModal = this.showModal.bind(this);
  }

  showModal() {
    showModal(AlertModal, { title: 'Alert', message: 'Hello World' });
  }

  showPreferences() {
    showModal(PreferencesModal, {});
  }

  render() {
    return (
      <div className="hello">
        Browser Network!
        <br />
        <Link to="/browser/intercept">Go to Intercept</Link>
        <br />
        <Link to="/crawler">Go to Crawler</Link>
        <br />
        <a role="button" onClick={() => this.showModal()}>
          View Modal
        </a>
        <br />
        <a role="button" onClick={() => this.showPreferences()}>
          Preferences
        </a>
      </div>
    );
  }
}
