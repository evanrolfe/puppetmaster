import React from 'react';
import BrowserSessionsDropdown from './BrowserSessionsDropdown';
import LayoutDropdown from './LayoutDropdown';

export default () => (
  <>
    <BrowserSessionsDropdown />

    <div className="browser-sessions pull-right">
      <i className="fas fa-spider" /> Crawler
    </div>

    <LayoutDropdown />
  </>
);
