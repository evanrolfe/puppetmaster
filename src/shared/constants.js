export const BACKEND_SOCKET_NAMES = {
  test: 'pntest-backend-test',
  production: 'pntest-backend-production',
  development: 'pntest-backend-development'
};

export const PROXY_SOCKET_NAMES = {
  test: 'pntest-proxy-test',
  production: 'pntest-proxy-production',
  development: 'pntest-proxy-development'
};

export const INTERCEPT_SOCKET_NAMES = {
  test: 'pntest-intercept-test',
  production: 'pntest-intercept-production',
  development: 'pntest-intercept-development'
};

export const DATABASE_FILES = {
  test: 'pntest-test.db',
  production: 'pntest-prod.db',
  development: 'pntest-dev.db'
};

export const DEFAULT_FILTERS = {
  hostList: [],
  hostSetting: '',
  pathList: [],
  pathSetting: '',
  extList: [],
  extSetting: '',
  resourceTypes: [
    'document',
    'eventsource',
    'fetch',
    'font',
    'image',
    'manifest',
    'media',
    'navigation',
    'other',
    'stylesheet',
    'script',
    'texttrack',
    'websocket',
    'xhr'
  ]
};
