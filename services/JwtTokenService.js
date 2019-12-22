const jwt = require('jsonwebtoken');
const { JWT_SECRET, TOKEN_EXPIRES } = require('../config').jwt;
/**
 * Get Login info from token
 * @param {any} payload Data to sign
 */
function sign(payload) {
  payload.expriesAt = Date.now() + TOKEN_EXPIRES * 1000;
  let options = { expiresIn: TOKEN_EXPIRES };
  if (typeof payload === 'string') {
    options = {};
  }
  return {
    token: jwt.sign(payload, JWT_SECRET),
    expriesAt: payload.expriesAt,
    expiresIn: TOKEN_EXPIRES * 1000
  };
}

/**
 *
 * @param  {string} token Token of user
 */
function verify(token) {
  console.log(token);

  return jwt.verify(token, JWT_SECRET);
}

module.exports = { jwt, sign, verify };
