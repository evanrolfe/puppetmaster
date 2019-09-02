// @flow
import React, { Component } from 'react';
// import { createHashHistory } from 'history';
import { Route } from 'react-router';
import { HashRouter } from 'react-router-dom';

import BrowserTabs from './components/BrowserTabs';

import BrowserSessions from './pages/BrowserSessions';
import BrowserNetwork from './pages/BrowserNetwork';
import BrowserIntercept from './pages/BrowserIntercept';

// const history = createHashHistory();

// import * as themeUtils from './utils/theme-utils';

export default class App extends Component {
  constructor() {
    super();
    document.body.setAttribute('theme', 'one-light');
  }
/*
  async generateTheme() {
    for(let i=0; i< themes.length; i++) {
      const theme = themes[i];
      const css = await themeUtils.generateThemeCSS(theme);

      console.log(`${theme.name}.less`)
      console.log(css);
    }
  }
*/
  render() {
    return (
      <div id="content">
        <div id="sidebar">X</div>

        <HashRouter>
          <div id="mainbar">
            <div id="tabs-bar">
              <Route exact path="/" component={BrowserTabs} />
              <Route path="/browser" component={BrowserTabs} />
            </div>

            <div>
              <Route exact path="/" component={BrowserSessions} />
              <Route
                exact
                path="/browser/sessions"
                component={BrowserSessions}
              />
              <Route exact path="/browser/network" component={BrowserNetwork} />
              <Route
                exact
                path="/browser/intercept"
                component={BrowserIntercept}
              />
            </div>
          </div>
        </HashRouter>
      </div>
    );
  }
}
