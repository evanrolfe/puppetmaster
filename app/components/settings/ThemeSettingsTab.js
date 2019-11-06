import React, { Component } from 'react';
import SettingsContext from '../../lib/SettingsContext';
import ThemeGraphic from './ThemeGraphic';

const THEMES_PER_ROW = 5;

export default class ThemeSettingsTab extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;

    this.renderTheme = this.renderTheme.bind(this);
    this.renderThemeRows = this.renderThemeRows.bind(this);
  }

  renderTheme(theme) {
    const themeName = theme;
    const themeDisplayName = theme;

    const isActive = themeName === this.context.settings.activeTheme;

    return (
      <div
        key={themeName}
        className="themes__theme"
        style={{ maxWidth: `${100 / THEMES_PER_ROW}%` }}
      >
        <h2 className="txt-lg">{themeDisplayName}</h2>
        <button
          onClick={() => this.context.changeSetting('activeTheme', themeName)}
          value={themeName}
          className={isActive ? 'active' : ''}
        >
          <ThemeGraphic themeName={themeName} />
        </button>
      </div>
    );
  }

  renderThemeRows(): React.Node {
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
        {currentRow.map(this.renderTheme)}
      </div>
    ));
  }

  render() {
    return <div className="themes pad-top">{this.renderThemeRows()}</div>;
  }
}

ThemeSettingsTab.contextType = SettingsContext;
