var express = require('express');
var router = express.Router();
const auth = require('../../services/AuthSerivce');
const File = require('../../models/File');
const jwt = require('../../services/JwtTokenService');
const User = require('../../models/User');
const jimp = require('jimp');
const fs = require('fs');
const rootPath = process.env.ROOT_PATH || __dirroot;
const path = require('path');
const { createError } = require('../../services/CustomError');
// Route
router.get('/', getFile);
router.get('/info', auth.getUserInfo, getFileInfo);
router.put('/update', auth.getUserInfo, putUpdateFile);

/**
 * Logout
 * @param {express.request} req
 * @param {express.response} res
 * @param {NextFuction} next
 */
async function getFile(req, res, next) {
  try {
    let { filename, imgCode } = req.query;
    const userId = jwt.verify(imgCode);
    let file = await File.findOne({ filename });
    if (!file) return next(Error.createError('File not found', 404));
    // Check permission access to file
    if (!file.isPublic && userId != file.owner) {
      return next(createError('You cannot access to file', 403));
    }
    let filePath = path.join(rootPath, file.path, file.filename);
    // Send file to client
    if (file.filetype === 'image')
      processImage(file, req.query).then(image => {
        image.getBuffer(jimp.MIME_JPEG, (err, buffer) => {
          res.set('Content-Type', jimp.MIME_JPEG);
          return res.send(buffer);
        });
      });
    else return res.sendFile(filePath);
  } catch (error) {
    return next(error);
  }
}

async function getFileInfo(req, res, next) {
  try {
    let user = req.user;
    let { filename } = req.query;
    let file = await File.findOne({ filename: filename });
    if (file.isPublic) return res.json(file);
    else {
      if (!user) return next(Error.createError("You can't access file", 403));
      if (user && file.owner === user._id) return res.json(file);
      else return next(Error.createError("You can't access file", 403));
    }
  } catch (error) {
    return next(error);
  }
}

async function putUpdateFile(req, res, next) {
  try {
    let user = req.user;
    let { filename, subOwner, tags } = req.body;
    let file = await File.findOne({ filename: filename });

    if (file.owner != null) {
      if (!user || user._id != file.owner)
        return next(Error.createError("You don't modify this file", 401));
      else {
        if (subOwner) file.subOwner = subOwner;
        if (tags) file.tags = file.tags;
      }
    } else {
      if (subOwner) file.subOwner = subOwner;
      if (tags) file.tags = file.tags;
      file.owner = user._id;
    }

    let result = await file.save();
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

/**
 *
 * @param {*} file
 * @param {*} query
 * size=wxh,
 * crop=top,left,width,height
 * scale=
 */
async function processImage(file, query) {
  console.log('send image to client');
  let { size, crop, scale } = query;
  let filePath = path.join(rootPath, file.path, file.filename);
  let image = await jimp.read(filePath);
  let w = image.getWidth();
  let h = image.getHeight();

  // Resize
  if (size) {
    w = Number(size.split('x')[0] || 50);
    h = Number(size.split('x')[1] || 50);
    image.resize(w, h);
  }

  // Crop
  if (crop) {
    let top = Number(crop.split(',')[0]);
    let left = Number(crop.split(',')[1]);
    let cWidth = Number(crop.split(',')[2]);
    let cHeight = Number(crop.split(',')[3]);
    if (left + cWidth > w) cWidth = w - left;
    if (top + cHeight > h) cHeight = h - top;
    image.crop(top, left, cWidth, cHeight);
  }

  // Scale
  if (scale) {
    scale = Number(scale);
    image.scale(scale);
  }

  return image;
}

module.exports = router;
