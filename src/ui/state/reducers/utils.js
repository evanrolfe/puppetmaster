import { getPane } from '../selectors';

const setNestedValue = (key, state, action) => {
  const newState = { ...state };

  newState[action.page][key] = action[key];

  return newState;
};

const setPaneValue = (key, state, action) => {
  const newState = { ...state };

  const pane = getPane(state, action.paneId, action.page);
  pane[key] = action[key];

  return newState;
};

export { setNestedValue, setPaneValue };
