import React from 'react';
import { Dropdown, DropdownButton, DropdownItem } from '../../dropdown';

type Props = {
  setOriginal: 'function',
  setModified: 'function',
  showModified: 'boolean'
};

export default ({ setOriginal, setModified, showModified }: Props) => {
  const renderIcon = option => {
    const original = option === 'original' && showModified === false;
    const modified = option === 'modified' && showModified === true;

    if (original || modified) {
      return <i className="fa fa-check" />;
    } else {
      return <i className="fa fa-empty" />;
    }
  };

  const dropdownTitle = showModified === true ? 'Modified' : 'Original';

  return (
    <div style={{ textAlign: 'right' }}>
      <Dropdown className="browser-sessions pull-right">
        <DropdownButton className="pointer btn btn--outlined btn--super-compact">
          {dropdownTitle}
          <i className="fa fa-caret-down space-left" />
        </DropdownButton>

        <DropdownItem onClick={setOriginal} style={{ minWidth: '120px' }}>
          {renderIcon('original')} Original
        </DropdownItem>
        <DropdownItem onClick={setModified} style={{ minWidth: '120px' }}>
          {renderIcon('modified')} Modified
        </DropdownItem>
      </Dropdown>
    </div>
  );
};
