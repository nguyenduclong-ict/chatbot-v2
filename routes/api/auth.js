var express = require('express');
var router = express.Router();

const { createError } = require('../../services/CustomError');
// models
var User = require('../../models/User');
// bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
// jwt
const jwt = require('../../services/JwtTokenService');
const tokenService = require('../../services/TokenServices');
// auth
const auth = require('../../services/AuthSerivce');

// Route
router.get('/user', auth.getUserInfo, getUserInfo);
router.post('/login', postLogIn);
router.post('/signup', postSignUp);
router.get('/refresh-token', auth.getUserInfo, getRefreshToken);

// Function
async function getUserInfo(req, res) {
  console.log(req.user);
  delete req.user.password;
  return res.json(req.user || {});
}

async function getRefreshToken(req, res, next) {
  try {
    // Xoa token cu
    tokenService.removeToken(req.token);
    let user = req.user;
    // Tao token moi cho user
    let payload = { email: user.email };
    let { token, expiresIn, expriesAt } = jwt.sign(payload);
    let result = { token, expiresIn, expriesAt, role: user.roles };
    tokenService.addToken(token);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function postLogIn(req, res, next) {
  let { email, password, username } = req.body;
  let user = await User.getUser({ email, username });

  try {
    if (user) {
      if (user.is_block) throw createError('Account is blocked', 401);
      // Check password
      let same = bcrypt.compareSync(password, user.password);
      console.log(same);
      if (same) {
        // Login success
        // Create Token for user
        let payload = {};
        if (user.email) {
          payload.email = user.email;
        }
        if (user.username) {
          payload.username = user.username;
        }
        _log(payload);
        let { token, expiresIn, expriesAt } = jwt.sign(payload);
        let imgCode = jwt.sign(user._id.toString()).token;
        let result = {
          token,
          expiresIn,
          expriesAt,
          roles: user.roles,
          imgCode
        };
        tokenService.addToken(token);
        return res.json(result);
      } else {
        // Password not match
        throw createError('Password not match', 401);
      }
    } else {
      // Không tồn tại user
      throw createError('Account not exits', 401);
    }
  } catch (error) {
    // MError handle
    return next(error);
  }
}

async function postSignUp(req, res, next) {
  let { email, password, username, info, roles } = req.body;
  password = bcrypt.hashSync(password, salt);
  try {
    let user = await User.addUser({ email, password, username, info, roles });
    return res.json(user);
  } catch (error) {
    // MError handle
    return next(error);
  }
}
module.exports = router;
