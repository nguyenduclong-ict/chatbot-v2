const jwt = require("./JwtTokenService");
const fs = require("fs");
var tokenList = [];
const jwt_secret = process.env.JWT_SECRET;
/**
 * Thêm token vào danh sách token
 * @param {*} token Token data
 */
function addToken(token) {
  let index = tokenList.indexOf(token);
  if (index === -1) tokenList.push(token);
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
  else throw Error.createError("Token not in tokenList");
}

/**
 * Đọc danh sách token từ file đã lưu
 * @param {string} path Đường dẫn đến file
 */
function readFromFile(path) {
  let data = [];
  try {
    data = fs.readFileSync(path);
    tokenList = JSON.parse(data);
  } catch (error) {
    console.log("Lỗi khi đọc tokenList từ file", path, error);
  }
}

/**
 * Lưu thông tin của token list vào file
 * @param {string} path Đường dẫn đến file
 */
function writeToFile(path) {
  try {
    let data = JSON.stringify(tokenList);
    fs.writeFileSync(path, data);
  } catch (error) {
    console.log("Lỗi khi lưu tokenList vào file", path, error);
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
