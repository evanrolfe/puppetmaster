import vkBeautify from 'vkbeautify';
// eslint-disable-next-line camelcase
import { js_beautify, html_beautify } from 'js-beautify';
import formatJson from './JsonLint';

const INDENT_CHARS = '  ';

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

export const isHTML = mimeType => mimeType.indexOf('html') !== -1;
export const isJSON = mimeType => mimeType.indexOf('json') !== -1;
export const isXML = mimeType => mimeType.indexOf('xml') !== -1;
export const isJavascript = mimeType => mimeType.indexOf('javascript') !== -1;
export const isCSS = mimeType => mimeType.indexOf('css') !== -1;

export const canPrettify = mimeType =>
  isJSON(mimeType) ||
  isXML(mimeType) ||
  isJavascript(mimeType) ||
  isHTML(mimeType) ||
  isCSS(mimeType);

export const prettifyCode = (code, mimeType) => {
  if (isJSON(mimeType)) {
    return prettifyJSON(code);
  } else if (isXML(mimeType)) {
    return prettifyXML(code);
  } else if (isJavascript(mimeType)) {
    return prettifyJavascript(code);
  } else if (isCSS(mimeType)) {
    return prettifyCSS(code);
  } else if (isHTML(mimeType)) {
    return prettifyHTML(code);
  }

  return code;
};

const prettifyJavascript = code => {
  try {
    const start = Date.now();
    const prettyCode = js_beautify(code, {
      indent_size: 2,
      space_in_empty_paren: true
    });
    const end = Date.now();

    console.log(`Beautified the JS code in ${end - start}ms`);

    return prettyCode;
  } catch (e) {
    return code;
  }
};

const prettifyHTML = code => {
  try {
    const start = Date.now();
    const prettyCode = html_beautify(code, {
      indent_size: 2,
      space_in_empty_paren: true
    });
    const end = Date.now();

    console.log(`Beautified the HTML code in ${end - start}ms`);

    return prettyCode;
  } catch (e) {
    return code;
  }
};

const prettifyJSON = code => {
  try {
    return formatJson(code, INDENT_CHARS);
  } catch (e) {
    return code;
  }
};

const prettifyXML = code => {
  try {
    return vkBeautify.xml(code, INDENT_CHARS);
  } catch (e) {
    return code;
  }
};

const prettifyCSS = code => {
  try {
    return vkBeautify.css(code, INDENT_CHARS);
  } catch (e) {
    return code;
  }
};

export const getMimeTypeFromResponse = headers => {
  // Convert all header keys to lower case
  const lowcaseHeaders = {};

  if (headers === undefined || headers === null) return DEFAULT_MIME_TYPE;

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

  if (contentType === undefined) return DEFAULT_MIME_TYPE;

  const mimeType = contentType.split(';')[0];
  if (ACCEPTED_MIME_TYPES.includes(mimeType)) {
    return mimeType;
  }
  /*
  const isProbablyHTML = body
    .slice(0, 100)
    .trim()
    .match(/^<!doctype html.*>/i);

  if (isProbablyHTML === true) return 'text/html';
*/
  return DEFAULT_MIME_TYPE;
};
