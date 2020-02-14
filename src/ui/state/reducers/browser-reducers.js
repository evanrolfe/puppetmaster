import { setNestedValue } from './utils';

const browsersLoaded = (state, action) =>
  setNestedValue('browsers', state, action);

const browserReducers = {
  BROWSERS_LOADED: browsersLoaded
};

export { browserReducers };
