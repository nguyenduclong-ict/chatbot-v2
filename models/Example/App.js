const mongoose = require('mongoose');

var Schema = mongoose.Schema;
var schema = new Schema({
  name: String,
  verify_token: String,
  app_id: {
    type: String,
    unique: true
  },
  app_secret: String,
  server_url: String,
  type: {
    type: String,
    enum: ['facebook', 'zalo', 'instagram']
  },
  created: { type: Date, default: Date.now() }
});

var App = mongoose.model('App', schema);

module.exports = App;
