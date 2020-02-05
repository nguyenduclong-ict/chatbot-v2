const mongoose = require('mongoose');
const { declareHook } = require('express-extra-tool').mongoose;

var Schema = mongoose.Schema;
var schema = new Schema({
  name: String,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  page_id: {
    type: Schema.Types.ObjectId,
    ref: 'Page'
  },
  color: String,
  type: {
    type: String,
    enum: ['customer', 'flow', 'job']
  },
  created: { type: Date, default: Date.now() }
});

var Tag = mongoose.model('Tag', schema);
declareHook(schema, 'Tag');

module.exports = Tag;
