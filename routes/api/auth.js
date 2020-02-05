var express = require('express');
var router = express.Router();

// models
var User = require('../../models/User');
// bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
// jwt
const jwt = require('express-extra-tool').jwt;
// auth
const getUserInfo = _md('get-user-info');
const authAdmin = _md('admin-role');
const { listPageOfUser } = _rq('providers/PageProvider');
const { getUser, addUser, updateUser, getManyUser } = _rq(
  'providers/UserProvider'
);
// Route
router.get('/me', getUserInfo, handleGetUserInfo);
router.post('/login', postLogIn);
router.put('/change-password', getUserInfo, putChangePassword);
router.post('/logout', getUserInfo, postLogout);
router.post('/signup', postSignUp);
router.get('/refresh-token', getUserInfo, getRefreshToken);

router.get('/user', getUserInfo, authAdmin, getListUser);
router.put('/user/:id', getUserInfo, authAdmin, handleUpdateUser);
// Function
/**
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function getListUser(req, res, next) {
  let { query, options } = _validateQuery(req.query);
  _log(query, options);
  try {
    query = _omit(query);
    const result = await getManyUser(query, options);
    return res.json(result);
  } catch (error) {
    _log('get List User error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleUpdateUser(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  if (data.new_password) {
    data.password = bcrypt.hashSync(data.new_password, salt);
    delete data.new_password;
  }
  try {
    const result = await updateUser({ _id: id }, data);
    return res.json(result);
  } catch (error) {
    _log('update User error : ', error);
    next(error);
  }
}

async function handleGetUserInfo(req, res, next) {
  if (req.user) {
    const pages = await listPageOfUser(req.user._id);
    delete req.user.password;
    req.user.pages = pages;
    let imgCode = jwt.sign(req.user._id.toString()).token;
    return res.json({ user: { ...req.user, imgCode: imgCode } });
  } else {
    next(_createError('Bạn chưa đăng nhập', 401));
  }
}

async function getRefreshToken(req, res, next) {
  try {
    // Xoa token cu
    let user = req.user;
    // Tao token moi cho user
    let payload = { email: user.email };
    let { token } = jwt.sign(payload);
    let result = { token };
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function postLogIn(req, res, next) {
  let { email, password, username } = req.body;
  let user = await getUser({ email, username });
  _log(user);
  try {
    if (user) {
      if (user.is_block)
        throw _createError('Tài khoản hiện đang bị khóa ', 401);
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
        let { token } = jwt.sign(payload);
        let result = {
          token
        };
        return res.json(result);
      } else {
        // Password not match
        throw _createError('Tài khoản hoặc mật khẩu không chính xác', 401);
      }
    } else {
      // Không tồn tại user
      throw _createError('Tài khoản không tồn tại', 401);
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
    let user = await addUser({ email, password, username, info, roles });
    return res.json(user);
  } catch (error) {
    // MError handle
    return next(error);
  }
}

/**
 * SignUp
 * @param {express.request} req
 * @param {express.response} res
 * @param {any} next
 */

async function putChangePassword(req, res, next) {
  let { password } = req.body;
  password = bcrypt.hashSync(password, salt);
  try {
    let user = await updateUser(req.user._id, { password });
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
  res.sendStatus(200);
}

module.exports = router;
