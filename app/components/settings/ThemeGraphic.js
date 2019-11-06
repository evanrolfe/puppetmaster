// @flow
import * as React from 'react';

export default class ThemeGraphic extends React.PureComponent<Props> {
  render() {
    return (
      <svg width="100%" height="100%" viewBox="0 0 500 300">
        <g subtheme={this.props.themeName}>
          {/* Panes */}
          <g className="theme--pane--sub">
            <rect x="0" y="0" width="100%" height="100%" className="bg-fill" />
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
            <rect x="0" y="0" width="5%" height="100%" className="bg-fill" />

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
          <rect x="50%" y="85%" width="5%" height="8%" className="info-fill" />
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
          <rect x="90%" y="85%" width="5%" height="8%" className="info-fill" />
        </g>
      </svg>
    );
  }
}
