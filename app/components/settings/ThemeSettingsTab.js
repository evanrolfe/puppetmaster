import React, { Component } from 'react';
import PropTypes from 'prop-types';

const THEMES_PER_ROW = 5;

export default class ThemeSettingsTab extends Component {
  constructor(props: Props) {
    super(props);

    this.renderTheme = this.renderTheme.bind(this);
    this.renderThemeRows = this.renderThemeRows.bind(this);
  }

  renderTheme(theme) {
    const themeName = theme;
    const themeDisplayName = theme;

    const isActive = themeName === this.props.activeTheme;

    return (
      <div
        key={themeName}
        className="themes__theme"
        style={{ maxWidth: `${100 / THEMES_PER_ROW}%` }}
      >
        <h2 className="txt-lg">{themeDisplayName}</h2>
        <button
          onClick={() => this.props.changeTheme(themeName)}
          value={themeName}
          className={isActive ? 'active' : ''}
        >
          <svg width="100%" height="100%" viewBox="0 0 500 300">
            <g subtheme={themeName}>
              {/* Panes */}
              <g className="theme--pane--sub">
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  className="bg-fill"
                />
                {/* Header Title Pane */}
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="10%"
                  className="theme--pane__header--sub bg-fill"
                />
              </g>

              {/* Sidebar */}
              <g className="theme--sidebar--sub">
                <rect
                  x="0"
                  y="0"
                  width="5%"
                  height="100%"
                  className="bg-fill"
                />

                {/* SideBar Icons */}
                <rect
                  x="0"
                  y="0"
                  width="5%"
                  height="40%"
                  className="theme--sidebar__header--sub bg-fill"
                />
              </g>

              {/* Lines */}
              <line
                x1="25%"
                x2="100%"
                y1="10%"
                y2="10%"
                strokeWidth="1"
                className="hl-stroke"
              />
              <line
                x1="62%"
                x2="62%"
                y1="0"
                y2="100%"
                strokeWidth="1"
                className="hl-stroke"
              />
              <line
                x1="25%"
                x2="25%"
                y1="0"
                y2="100%"
                strokeWidth="1"
                className="hl-stroke"
              />
              <line
                x1="0"
                x2="25%"
                y1="10%"
                y2="10%"
                strokeWidth="1"
                className="hl-stroke"
              />

              {/* Colors */}
              <rect
                x="40%"
                y="85%"
                width="5%"
                height="8%"
                className="success-fill"
              />
              <rect
                x="50%"
                y="85%"
                width="5%"
                height="8%"
                className="info-fill"
              />
              <rect
                x="60%"
                y="85%"
                width="5%"
                height="8%"
                className="warning-fill"
              />
              <rect
                x="70%"
                y="85%"
                width="5%"
                height="8%"
                className="danger-fill"
              />
              <rect
                x="80%"
                y="85%"
                width="5%"
                height="8%"
                className="surprise-fill"
              />
              <rect
                x="90%"
                y="85%"
                width="5%"
                height="8%"
                className="info-fill"
              />
            </g>
          </svg>
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

ThemeSettingsTab.propTypes = {
  changeTheme: PropTypes.func.isRequired,
  activeTheme: PropTypes.string.isRequired
};
