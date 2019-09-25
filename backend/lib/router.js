const capitalise = s => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const parseParamsUrlToObject = (paramsUrl, params) => {
  paramsUrl.split('&').forEach(paramSegment => {
    const paramSplit = paramSegment.split('=');

    params[paramSplit[0]] = paramSplit[1];
  });
};

const getResult = async request => {
  const params = request.args;
  let result;

  const mainUrl = request.url.split('?')[0];
  const paramsUrl = request.url.split('?')[1];

  if (paramsUrl !== undefined) {
    parseParamsUrlToObject(paramsUrl, params);
  }

  const urlSegments = mainUrl.split('/').filter(segment => segment !== '');
  const lastSegment = urlSegments[urlSegments.length - 1];

  // TODO Make this work for nested controllers)
  const controllerName = `${capitalise(urlSegments[0])}Controller`;
  const Controller = require(`../controllers/${controllerName}`);
  let controller;
  const matches = lastSegment.match(/\d+/);

  // If the last segment is not a digit(s)
  if (matches === null) {
    controller = new Controller(params);

    switch (request.method) {
      case 'GET':
        result = await controller.index();
        break;
      case 'POST':
        result = await controller.create();
        break;
      default:
        throw new Error(`Unknown method: ${request.method}!`);
    }
  } else {
    params.id = parseInt(matches[0]);
    controller = new Controller(params);

    switch (request.method) {
      case 'GET':
        result = await controller.show();
        break;
      case 'PATCH':
        result = await controller.update();
        break;
      case 'DELETE':
        result = await controller.delete();
        break;
      default:
        throw new Error(`Unknown method: ${request.method}!`);
    }
  }

  return result;
};

module.exports = {
  getResult: getResult
};
