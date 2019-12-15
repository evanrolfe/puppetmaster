import React from 'react';
import { useDispatch, useSelector } from '../state/state';
import { PAGE_LAYOUTS } from '../state/constants';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownDivider
} from './dropdown';

export default () => {
  console.log(`[RENDER] LayoutDropdown`);

  const dispatch = useDispatch();
  const activePageLayout = useSelector(
    state => state.browserNetworkPage.pageLayout
  );

  const dropdownRef = React.createRef();

  const setLayout = (layoutKey, event) => {
    event.stopPropagation();

    dispatch({
      type: 'SET_LAYOUT',
      page: 'browserNetworkPage',
      pageLayout: layoutKey
    });

    dropdownRef.current.toggle();
  };

  const renderItem = layout => {
    const active = activePageLayout === layout.key;

    return (
      <DropdownItem onClick={setLayout} value={layout.key} active={active}>
        <span style={{ paddingLeft: '8px' }}>{layout.title}</span>
      </DropdownItem>
    );
  };

  return (
    <Dropdown ref={dropdownRef} className="browser-sessions pull-right">
      <DropdownButton className="browser-sessions">
        <i className="fas fa-columns" /> Layout
      </DropdownButton>

      <DropdownDivider>Vertical:</DropdownDivider>

      {PAGE_LAYOUTS.vertical.map(layout => renderItem(layout))}

      <DropdownDivider>Horizontal:</DropdownDivider>

      {PAGE_LAYOUTS.horizontal.map(layout => renderItem(layout))}
    </Dropdown>
  );
};
