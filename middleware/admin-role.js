const express = require('express');
/**
 *
 * @param {express.request} req express req
 * @param {express.response} res
 * @param { NextFunction } next
 */
async function adminRoleMiddleware(req, res, next) {
  // Check admin role
  try {
    if (!req.user) throw _createError('Bạn chưa đăng nhập', 401);
    const pass = req.user.roles.find(role => role.value === 'admin');
    if (!pass) {
      throw _createError('Bạn không có quyền truy cập tài nguyên này', 403);
    } else {
      next();
    }
  } catch (error) {
    return next(error);
  }
}

module.exports = adminRoleMiddleware;
