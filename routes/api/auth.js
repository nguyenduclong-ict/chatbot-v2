var express = require('express');
var router = express.Router();

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
const getUserInfo = _md('get-user-info');
const { listPageOfUser } = require('../../providers/PageProvider');
// Route
router.get('/me', getUserInfo, handleGetUserInfo);
router.post('/login', postLogIn);
router.post('/logout', getUserInfo, postLogout);
router.post('/signup', postSignUp);
router.get('/refresh-token', getUserInfo, getRefreshToken);

// Function
async function handleGetUserInfo(req, res, next) {
  if (req.user) {
    const pages = await listPageOfUser(req.user._id);
    delete req.user.password;
    req.user.pages = pages;
    let imgCode = jwt.sign(req.user._id.toString()).token;
    return res.json({ user: { ...req.user, imgCode: imgCode } });
  } else {
    next(Error.Error.createError('Bạn chưa đăng nhập', 401));
  }
}

async function getRefreshToken(req, res, next) {
  try {
    // Xoa token cu
    tokenService.removeToken(req.token);
    let user = req.user;
    // Tao token moi cho user
    let payload = { email: user.email };
    let { token } = jwt.sign(payload);
    let result = { token };
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
      if (user.is_block)
        throw Error.createError('Tài khoản hiện đang bị khóa ', 401);
      // Check password
      let same = bcrypt.compareSync(password, user.password);
      if (same) {
        // Login success, Create Token for user
        let payload = {};
        if (user.email) {
          payload.email = user.email;
        } else if (user.username) {
          payload.username = user.username;
        }
        _log(payload);
        let { token } = jwt.sign(payload);
        let result = {
          token
        };
        tokenService.addToken(token);
        return res.json(result);
      } else {
        // Password not match
        throw Error.createError('Tài khoản hoặc mật khẩu không chính xác', 401);
      }
    } else {
      // Không tồn tại user
      throw Error.createError('Tài khoản không tồn tại', 401);
    }
  } catch (error) {
    // MError handle
    next(error);
  }
}

/**
 * SignUp
 * @param {express.request} req
 * @param {express.response} res
 * @param {any} next
 */

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

/**
 * Logout
 * @param {express.request} req
 * @param {express.response} res
 * @param {any} next
 */

function postLogout(req, res) {
  tokenService.removeToken(req.token);
  res.sendStatus(200);
}

module.exports = router;
