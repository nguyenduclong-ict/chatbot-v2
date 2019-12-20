const JwtTokenService = require("./JwtTokenService");
const TokenService = require("./TokenServices");
const User = require("../models/User");
/**
 * Middleware check role of user
 * @param {Array} roles Array of role check
 * @param {*} options
 * type : 'and' | 'or' if == 'and' then user role include all array, 'or' user role contain one in array
 */
function roles(roles = [], options = { type: "and" | "or" }) {
  return function(req, res, next) {
    let result = false;
    let user = req.user;
    if(!user) throw Error.createError("Cannot get user info from login", 401);
    for (let role of roles) {
      let index = user.role.indexOf(role);
      console.log(options);
      // if role contain one
      if (options.type === "or" && index > -1) {
        result = true;
        break;
      } else result = false;
      // if role contain all
      if (options.type === "and" && index === -1) {
        result = false;
        break;
      } else result = true;
    }
    if (result === false) return next(Error.createError("Access denied", 403));
    else return next();
  };
}

async function getUserInfo(req, res, next) {
  // get token from header
  // Check token on token list
  try {
    if (!req.headers.authorization) return next();
    let token = req.headers.authorization.split(" ")[1];
    let tokenData = TokenService.getTokenData(token);
    req.token = token;
    req.user = await User.getUser({ email: tokenData.email });
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { getUserInfo, roles };
