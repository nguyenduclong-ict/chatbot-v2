var express = require("express");
var router = express.Router();
const File = _rq("models/File");
const upload = require("../../services/upload");

// middle ware
router.middlewares = ["get-user-info"];

// Route
router.post("/files", upload.array("files", 10), postUploadFiles);

// Upload array of file
async function postUploadFiles(req, res, next) {
  let promise = [];
  try {
    let { subOwner = [], tags = [], isPublic = true } = req.body;
    req.files.forEach(async (element, i) => {
      let filename = element.filename;
      let filepath = element.destination;
      let filetype = element.mimetype.split("/")[0];
      let obj = {
        owner: req.user ? req.user._id : null,
        subOwner: subOwner,
        filename: filename,
        path: filepath,
        filetype: filetype,
        isPublic: isPublic,
        tags: tags,
      };

      let file = new File(obj);
      promise.push(file.save());
    });
    Promise.all(promise).then((result) => {
      return res.json(result);
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = router;
