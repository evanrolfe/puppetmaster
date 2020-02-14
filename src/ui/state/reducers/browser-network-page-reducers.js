import { DEFAULT_PAGE_LAYOUTS } from '../constants';
import { setNestedValue, setPaneValue } from './utils';

const setDraggingPane = (state, action) =>
  setPaneValue('draggingPane', state, action);
const setPaneLength = (state, action) => setPaneValue('length', state, action);
const setPaneTabindex = (state, action) =>
  setPaneValue('tabIndex', state, action);
const setShowModifiedRequest = (state, action) =>
  setNestedValue('showModifiedRequest', state, action);
const setShowModifiedResponse = (state, action) =>
  setNestedValue('showModifiedResponse', state, action);

const setSearch = (state, action) => {
  const newFilters = Object.assign({}, state[action.page].filters);
  newFilters.search = action.value;

  const newState = { ...state };
  newState[action.page].filters = newFilters;
  return newState;
};

const setFilters = (state, action) => {
  const newFilters = Object.assign({}, state[action.page].filters);

  Object.keys(action.filters).forEach(key => {
    newFilters[key] = action.filters[key];
  });

  const newState = { ...state };
  newState[action.page].filters = newFilters;
  return newState;
};

const setLayout = (state, action) => {
  const newState = { ...state };

  newState[action.page].pageLayout = action.pageLayout;
  newState[action.page].page = DEFAULT_PAGE_LAYOUTS[action.pageLayout];

  return newState;
};

const setBodyTabView = (state, action) => {
  const newState = { ...state };
  newState[action.page].viewMode = action.viewMode;
  newState[action.page].viewContent = action.viewContent;
  return newState;
};

const toggleColumnOrder = (state, action) => {
  const newState = { ...state };

  if (action.columnKey !== state[action.page].orderBy) {
    newState[action.page].orderBy = action.columnKey;
  } else {
    newState[action.page].dir =
      state[action.page].dir === 'asc' ? 'desc' : 'asc';
  }

  return newState;
};

const setColumnWidth = (state, action) => {
  const newState = { ...state };
  const newTableColumns = [...state[action.page].requestsTableColumns];
  newTableColumns[action.columnIndex].width = action.width;

  newState[action.page].requestsTableColumns = newTableColumns;

  return newState;
};

const setScrolltop = (state, action) =>
  setNestedValue('requestsTableScrollTop', state, action);

const setOrientation = (state, action) => {
  const newState = { ...state };

  newState.browserNetworkPage.page.orientation = action.orientation;

  // Set default lengths for each pane:
  let defaultLength;
  if (action.orientation === 'vertical') {
    defaultLength = 500;
  } else if (action.orientation === 'horizontal') {
    defaultLength = 200;
  }
  newState.browserNetworkPage.page.panes.forEach(pane => {
    pane.length = defaultLength;
  });

  return newState;
};

const setTablecolumns = (state, action) =>
  setNestedValue('requestsTableColumns', state, action);

const browserNetworkPageReducers = {
  SET_DRAGGING_PANE: setDraggingPane,
  SET_PANE_LENGTH: setPaneLength,
  SET_PANE_TABINDEX: setPaneTabindex,
  SET_SHOW_MODIFIED_REQUEST: setShowModifiedRequest,
  SET_SHOW_MODIFIED_RESPONSE: setShowModifiedResponse,
  SET_SEARCH: setSearch,
  SET_FILTERS: setFilters,
  SET_LAYOUT: setLayout,
  SET_BODYTAB_VIEW: setBodyTabView,
  SET_ORIENTATION: setOrientation,
  SET_TABLECOLUMNS: setTablecolumns,

  // BrowserNetworkPage (TODO)
  TOGGLE_COLUMN_ORDER: toggleColumnOrder,
  SET_COLUMN_WIDTH: setColumnWidth,
  SET_SCROLLTOP: setScrolltop
};

export { browserNetworkPageReducers };
