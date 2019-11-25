import React from 'react';
import { useTrackedState, useDispatch } from '../../state/state';
import ThemeGraphic from './ThemeGraphic';

const THEMES_PER_ROW = 5;

export default () => {
  const state = useTrackedState();
  const dispatch = useDispatch();
  const { activeTheme } = state;

  const renderTheme = theme => {
    const themeName = theme;
    const themeDisplayName = theme;

    const isActive = themeName === activeTheme;

    return (
      <div
        key={themeName}
        className="themes__theme"
        style={{ maxWidth: `${100 / THEMES_PER_ROW}%` }}
      >
        <h2 className="txt-lg">{themeDisplayName}</h2>
        <button
          onClick={() =>
            dispatch({ type: 'SET_THEME_STORAGE', theme: themeName })
          }
          value={themeName}
          className={isActive ? 'active' : ''}
        >
          <ThemeGraphic themeName={themeName} />
        </button>
      </div>
    );
  };

  const renderThemeRows = () => {
    const themes = [
      'default',
      'high-contrast-light',
      'hyper',
      'material',
      'one-dark',
      'one-light',
      'purple',
      'railscasts',
      'simple-dark',
      'simple-light',
      'solarized-dark',
      'solarized',
      'solarized-light'
    ];

    const rows = [];
    let row = [];
    for (const theme of themes) {
      row.push(theme);
      if (row.length === THEMES_PER_ROW) {
        rows.push(row);
        row = [];
      }
    }

    // Push the last row if it wasn't finished
    if (row.length) {
      rows.push(row);
    }

    return rows.map((currentRow, i) => (
      <div key={i} className="themes__row">
        {currentRow.map(renderTheme)}
      </div>
    ));
  };

  return <div className="themes pad-top">{renderThemeRows()}</div>;
};
