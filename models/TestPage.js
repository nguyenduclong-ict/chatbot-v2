const mongoose = require('mongoose');

var Schema = mongoose.Schema;
var schema = new Schema({
  name: String,
  image: String,
  page_access_token: String,
  verify_token: String,
  app_secret: String,
  server_url: String,
  created: { type: Date, default: Date.now() }
});

var UserRole = mongoose.model('TestPage', schema);

module.exports = UserRole;
