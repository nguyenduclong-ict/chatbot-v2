const jwt = require('./JwtTokenService');
const fs = require('fs');
const path = require('path');
let time;
let currentPath;
var tokenList = [];

/**
 * Thêm token vào danh sách token
 * @param {*} token Token data
 */
function addToken(token) {
  let index = tokenList.indexOf(token);
  if (index === -1) tokenList.push(token);
  // if (!time || Date.now() - time > 5 * 60 * 1000) {
  //   time = Date.now();
  //   writeToFile();
  // }
}

/**
 * Xóa Token khỏi danh sách token
 * @param {*} token Token data
 */
function removeToken(token) {
  let index = tokenList.indexOf(token);
  if (index > -1) tokenList.splice(index, 1);
}

function getTokenData(token) {
  let index = tokenList.indexOf(token);
  if (index > -1) return jwt.verify(token);
  else throw Error.createError('Token not in tokenList', 401);
}

/**
 * Đọc danh sách token từ file đã lưu
 * @param {string} _path Đường dẫn đến file
 */
function readFromFile(_path) {
  let uPath = '';
  const arr = _path.split('/');
  arr.forEach((e, index) => {
    uPath = path.join(uPath, e);
    const pp = path.join(__dirroot, uPath);
    if (!fs.existsSync(pp)) {
      if (index < arr.length - 1) {
        fs.mkdirSync(pp, '774');
        console.log('Created folder ...', path.join(pp));
      } else {
        fs.writeFileSync(pp, '[]', { mode: '774' });
        console.log('Created file ...', path.join(pp));
      }
    }
  });
  if (!path.isAbsolute(_path)) _path = path.join(__dirroot, _path);
  let data = [];
  try {
    data = fs.readFileSync(_path);
    tokenList = JSON.parse(data);
    currentPath = _path;
  } catch (error) {
    console.log('Lỗi khi đọc tokenList từ file', _path, error);
  }
}

/**
 * Lưu thông tin của token list vào file
 * @param {string} _path Đường dẫn đến file
 */
function writeToFile(_path) {
  _path = _path || currentPath;
  if (!path.isAbsolute(_path)) _path = path.join(__dirroot, _path);
  try {
    const data = JSON.stringify(tokenList);
    _log('Write token list to file ', _path);
    fs.writeFileSync(_path, data);
  } catch (error) {
    console.log('Lỗi khi lưu tokenList vào file', _path, error);
  }
}

// Read token list from database
function readFromDatabase() {}

// Save token list to database
function writeToDatabase() {}

module.exports = {
  addToken,
  removeToken,
  getTokenData,
  readFromFile,
  writeToFile,
  readFromDatabase,
  writeToDatabase
};
