const { mongoose } = require('../services/MongoService');
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
function addTag(data) {
  let doc = new Tag(data);
  return doc.save();
}

async function updateTag(_id, data) {
  let doc = await Tag.findById(_id);
  if (doc) for (let key of data) doc[key] = data[key];
  return doc.update();
}

module.exports = { model: Tag, addTag, updateTag };
