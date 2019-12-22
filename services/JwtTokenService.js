const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET || 'longnd';
var tokenExpires = Number(process.env.TOKEN_EXPIRES) || 3600;
/**
 * Get Login info from token
 * @param {any} payload Data to sign
 */
function sign(payload) {
  payload.expriesAt = Date.now() + tokenExpires * 1000;
  let options = { expiresIn: tokenExpires };
  if (typeof payload === 'string') {
    options = {};
  }
  return {
    token: jwt.sign(payload, jwt_secret),
    expriesAt: payload.expriesAt,
    expiresIn: tokenExpires * 1000
  };
}

/**
 *
 * @param  {string} token Token of user
 */
function verify(token) {
  console.log(token);

  return jwt.verify(token, jwt_secret);
}

module.exports = { jwt, sign, verify };
