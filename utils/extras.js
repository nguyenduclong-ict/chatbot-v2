const path = require('path');
global._ = require('lodash');
/**
 *
 * @param {string} url url
 * @param {object} parameters query parameters
 */
module.exports.makeURL = (url, parameters) => {
  const query = Object.entries(parameters)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  if (query) {
    return url + '?' + query;
  } else {
    return url + query;
  }
};

Object.defineProperty(global, '__stack', {
  get: function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
      return stack;
    };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: function() {
    return __stack[1].getLineNumber();
  }
});

global._log = function() {
  const orig = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  const err = new Error();
  Error.captureStackTrace(err, arguments.callee);
  const callee = err.stack[0];
  Error.prepareStackTrace = orig;
  const f = path.relative(process.cwd(), callee.getFileName());
  const line = callee.getLineNumber();
  console.log(`---%s:`, f, line, '\n', ...arguments);
};

/**
 *
 * @param {*} obj Object source
 * @param {*} keys path of data. eg. 'info/name' or ['info','name']
 */
function get(obj, keys) {
  if (arguments.length === 1) return obj;

  if (typeof keys === 'string') {
    keys = keys.split('/');
  }

  if (typeof obj !== 'object' || keys.length === 0) {
    return obj;
  }

  key = keys.shift();
  return get(obj[key], keys);
}
global._get = get;

/**
 *
 * @param {Object} obj Object source
 * @param {string|array} keys path of value in object. eg. info/age || ['info','age']
 * @param {*} value value you want set
 */
function set(obj, keys, value) {
  if (arguments.length < 3) return false;

  if (typeof keys === 'string') {
    keys = keys.split('/');
  }

  let tmp = obj;

  while (keys.length > 1) {
    key = keys.shift();
    tmp = tmp[key] = tmp[key] || {};
  }

  key = keys.shift();
  if (key === undefined) return false;

  tmp[key] = value;
  return obj;
}
global._set = set;

global._omit = function(data = {}, omitValue = []) {
  this.Object.keys(data).forEach(key => {
    if (omitValue.includes(data[key])) delete data[key];
  });
  if (Array.isArray(data)) return data.filter(e => !!e);
  return data;
};
