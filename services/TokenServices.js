const jwt = require('./JwtTokenService');
const redis = require('redis');
const { driver, config } = require('../config').token;
const tokens = {};
var client = redis.createClient();

function init() {
  if (driver === 'redis') {
    const { host, port } = config;
    client = redis.createClient({ host, port });
  }
}

/**
 * Thêm token vào danh sách token
 * @param {*} token Token data
 */

function addToken(token) {
  switch (driver) {
    case 'redis':
      client.set(token, true);
      break;
    default:
      tokens[token] = true;
      break;
  }
  tokens[token] = true;
}

/**
 * Xóa Token khỏi danh sách token
 * @param {*} token Token data
 */

function removeToken(token) {
  switch (driver) {
    case 'redis':
      client.del(token);
      break;
    default:
      delete tokens[token];
      break;
  }
}

function getTokenData(token) {
  if (driver === 'redis') {
    if (client.get(token)) {
      return jwt.verify(token);
    } else {
      throw _createError('Token not in tokens', 401);
    }
  } else {
    if (tokens[token]) {
      return jwt.verify(token);
    } else {
      throw _createError('Token not in tokens', 401);
    }
  }
}

init();

module.exports = {
  addToken,
  removeToken,
  getTokenData
};
