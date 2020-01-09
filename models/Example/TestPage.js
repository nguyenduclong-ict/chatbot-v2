const mongoose = require('mongoose');

var Schema = mongoose.Schema;
var schema = new Schema({
  name: String,
  image: String,
  page_access_token: String,
  page_id: {
    type: String,
    unique: true
  },
  app_id: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },
  verify_token: {
    type: String,
    required: true
  },
  created: { type: Date, default: Date.now() }
});

var TestPage = mongoose.model('TestPage', schema);

module.exports = TestPage;
