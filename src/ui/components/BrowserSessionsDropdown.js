import React from 'react';
import { useDispatch, useSelector } from '../state/state';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownDivider
} from './dropdown';
import EditBrowserModal from './modals/EditBrowserModal';

export default () => {
  console.log(`[RENDER] BrowserSessionsDropdown`);

  const dispatch = useDispatch();
  const browsers = useSelector(state => state.browserNetworkPage.browsers);

  console.log(
    `[RENDER] BrowserSessionsDropdown with ${browsers.length} browsers`
  );

  const dropdownRef = React.createRef();

  global.backendConn.listen('browsersChanged', () => {
    dispatch({ type: 'LOAD_BROWSERS' });
  });

  const browserModals = {};
  browsers.forEach(browser => {
    browserModals[browser.id] = React.createRef();
  });

  const saveBrowserTitle = (browserId, title) => {
    console.log(`Saving browser id: ${browserId} with title: ${title}`);
    global.backendConn.send('BrowsersController', 'update', {
      browserId: browserId,
      title: title
    });
  };

  const openBrowser = browserId => {
    global.backendConn.send('BrowsersController', 'open', {
      browserId: browserId
    });
  };

  const editBrowser = (event, browserId) => {
    event.stopPropagation();

    dropdownRef.current.toggle();
    browserModals[browserId].current.show();
  };

  const createSession = () => {
    global.backendConn.send('BrowsersController', 'create', {});
  };

  return (
    <>
      {browsers.map(browser => (
        <EditBrowserModal
          ref={browserModals[browser.id]}
          browser={browser}
          saveBrowserTitle={saveBrowserTitle}
        />
      ))}

      <Dropdown ref={dropdownRef} className="browser-sessions pull-right">
        <DropdownButton className="browser-sessions">
          <i className="fas fa-window-restore" /> Browser ({browsers.length})
        </DropdownButton>

        <DropdownDivider>Browser Sessions:</DropdownDivider>
        {browsers.map(browser => (
          <DropdownItem
            browserLink
            browserTitle={browser.title}
            onClick={() => openBrowser(browser.id)}
            editBrowser={e => editBrowser(e, browser.id)}
          />
        ))}
        <DropdownDivider>Actions:</DropdownDivider>
        <DropdownItem onClick={createSession}>
          <span style={{ paddingLeft: '8px' }}>New Session</span>
        </DropdownItem>
      </Dropdown>
    </>
  );
};
