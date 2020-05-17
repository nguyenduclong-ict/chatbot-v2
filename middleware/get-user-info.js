const jwt = require("express-extra-tool").jwt;
const { getUser } = _rq("providers/UserProvider");
module.exports = async function (req, res, next) {
  // get token from header
  // Check token on token list
  try {
    if (!req.headers.authorization) return next();
    let token = req.headers.authorization.split(" ")[1];
    let tokenData = jwt.verify(token);
    req.user = await getUser({
      $or: [
        {
          email: tokenData.email,
        },
        {
          username: tokenData.username,
        },
      ],
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
