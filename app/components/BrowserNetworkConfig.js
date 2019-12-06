import React from 'react';
import { useSelector } from '../state/state';
import BrowserSessionsDropdown from './BrowserSessionsDropdown';
import LayoutDropdown from './LayoutDropdown';

export default () => {
  const interceptEnabled = useSelector(
    state => state.browserInterceptPage.interceptEnabled
  );

  return (
    <>
      <BrowserSessionsDropdown />

      <div className="browser-sessions pull-right">
        <i className="fas fa-spider" /> Crawler
      </div>

      <div className="browser-sessions pull-right">
        <i className="fas fa-random" /> Intecept:{' '}
        {interceptEnabled ? 'On' : 'Off'}
      </div>

      <LayoutDropdown />
    </>
  );
};
