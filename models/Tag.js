const { mongoose, declareHook } = require('../services/MongoService');
const validator = require('validator');

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
  created: { type: Date, default: Date.now() }
});

var Tag = mongoose.model('Tag', schema);
declareHook(schema, 'Tag');

module.exports = Tag;
