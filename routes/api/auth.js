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
const auth = require('../../services/AuthSerivce');
const Page = require('../../models/Page').model;
const { listPageOfUser } = require('../../providers/PageProvider');
// Route
router.get('/me', auth.getUserInfo, getUserInfo);
router.post('/login', postLogIn);
router.post('/logout', auth.getUserInfo, postLogout);
router.post('/signup', postSignUp);
router.get('/refresh-token', auth.getUserInfo, getRefreshToken);
router.all('/facebook', (req, res) => {
  console.log(req.query, req.body);
});
// Function
async function getUserInfo(req, res, next) {
  if (req.user) {
    const pages = await listPageOfUser(req.user._id);
    delete req.user.password;
    req.user.pages = pages;
    return res.json({ user: req.user });
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
      if (user.is_block)
        throw Error.createError('Tài khoản hiện đang bị khóa ', 401);
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

function postLogout(req, res) {
  console.log(req.token);
  tokenService.removeToken(req.token);
  res.sendStatus(200);
}

module.exports = router;
