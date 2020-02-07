import puppeteer from 'puppeteer';
import { DEFAULT_FILTERS } from '../src/shared/constants';

const clearDatabase = async () => {
  await global.knex.raw('Delete FROM browsers;');
  await global.knex.raw('DELETE FROM SQLITE_SEQUENCE WHERE name="browsers";');
  await global.knex.raw('Delete FROM capture_filters;');
  await global.knex.raw(
    'DELETE FROM SQLITE_SEQUENCE WHERE name="capture_filters";'
  );
  await global.knex.raw('Delete FROM requests;');
  await global.knex.raw('DELETE FROM SQLITE_SEQUENCE WHERE name="requests";');

  const filters = Object.assign({}, DEFAULT_FILTERS);
  filters.hostList = ['localhost'];

  await global
    .knex('capture_filters')
    .insert({ id: 1, filters: JSON.stringify(filters) });
};

const openBrowser = async () => {
  await backendConn.send('BrowsersController', 'create', {});

  // Connect to the browser we just opened so we can control it:
  return puppeteer.connect({ browserURL: 'http://localhost:9222' });
};

const sleep = n => new Promise(resolve => setTimeout(resolve, n));

export { clearDatabase, openBrowser, sleep };
