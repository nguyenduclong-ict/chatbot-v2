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
  tags: {
    type: [Schema.Types.ObjectId],
    ref: 'Tag'
  },
  created: { type: Date, default: Date.now() }
});

var Flow = mongoose.model('Flow', schema);
declareHook(schema, 'Flow');

module.exports = Flow;
