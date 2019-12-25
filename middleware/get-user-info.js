const TokenService = require('../services/TokenServices');
const User = require('../models/User');
module.exports = async function(req, res, next) {
  // get token from header
  // Check token on token list
  try {
    if (!req.headers.authorization) return next();
    let token = req.headers.authorization.split(' ')[1];
    let tokenData = TokenService.getTokenData(token);
    req.user = await User.getUser({
      email: tokenData.email,
      username: tokenData.username
    });
    if (req.user) {
      req.user.token_expires_at = new Date(tokenData.exp * 1000);
      req.user.token_expires_in = tokenData.expiresIn;
    }
    req.token = token;
    return next();
  } catch (error) {
    return next(error);
  }
};
