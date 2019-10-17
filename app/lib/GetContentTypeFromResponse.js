const ACCEPTED_MIME_TYPES = [
  'text/css',
  'text/x-scss',
  'text/x-less',
  'text/javascript',
  'text/typescript',
  'application/json',
  'application/ld+json',
  'application/typescript',
  'application/javascript',
  'text/html',
  'application/xml'
];

const DEFAULT_MIME_TYPE = 'text/javascript';

const getContentTypeFromResponse = (body, headers) => {
  // Convert all header keys to lower case
  const lowcaseHeaders = {};

  try {
    headers = JSON.parse(headers);
  } catch (e) {
    return DEFAULT_MIME_TYPE;
  }

  Object.keys(headers).forEach(key => {
    const lowcaseKey = key.toLowerCase();
    lowcaseHeaders[lowcaseKey] = headers[key];
  });

  const contentType = lowcaseHeaders['content-type'];
  const mimeType = contentType.split(';')[0];

  if (ACCEPTED_MIME_TYPES.includes(mimeType)) {
    return mimeType;
  }

  return DEFAULT_MIME_TYPE;
};

export default getContentTypeFromResponse;
