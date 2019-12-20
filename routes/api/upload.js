var express = require('express');
var router = express.Router();
const fs = require('fs');
const File = require('../../models/File');

// middle ware
router.middlewares = ['get-user-info'];

// Setup multer
const multer = require('multer');
const path = require('path');
const uploadPath = process.env.UPLOAD_PATH;
const rootPath = process.env.ROOT_PATH;
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};
// Storage
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = uploadPath;
    if (req.user) dir = `${uploadPath}/${req.user.email}`;
    else dir = `${uploadPath}/anonymus`;
    if (!fs.existsSync(path.join(rootPath, dir))) {
      console.log('Create Folder ...', path.join(rootPath, dir));
      fs.mkdirSync(path.join(rootPath, dir));
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    if (!MIME_TYPE_MAP[file.mimetype])
      return cb(new Error('Định dạng file không được hỗ trợ'), null);
    else {
      let r = Math.random()
        .toString(36)
        .substring(2);
      cb(
        null,
        file.fieldname +
          '-' +
          Date.now() +
          '-' +
          r +
          '.' +
          MIME_TYPE_MAP[file.mimetype]
      );
    }
  }
});
// Init upload
var upload = multer({
  storage: storage
});

// Route
router.post('/files', upload.array('files', 10), postUploadFiles);

// Upload array of file
async function postUploadFiles(req, res) {
  let promise = [];
  try {
    let { subOwner = [], tags = [], isPublic = true } = req.body;
    req.files.forEach(async (element, i) => {
      console.log(element);
      let filename = element.filename;
      let filepath = element.destination;
      let filetype = element.mimetype.split('/')[0];
      let obj = {
        owner: req.user ? req.user._id : null,
        subOwner: subOwner,
        filename: filename,
        path: filepath,
        filetype: filetype,
        public: isPublic,
        tags: tags
      };

      let file = new File.model(obj);
      promise.push(file.save());
    });
    Promise.all(promise).then(result => {
      return res.json(result);
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = router;
