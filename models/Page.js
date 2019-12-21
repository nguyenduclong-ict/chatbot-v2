const { mongoose } = require('../services/MongoService');
const validator = require('validator');

var Schema = mongoose.Schema;
var schema = new Schema({
  name: String,
  token: String,
  type: String,
  token_expires: Date,
  persistent_menu: Schema.Types.Map,
  get_started: Object,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }, // user id ref
  user_facebook_id: String, // map to user info
  created: { type: Date, default: Date.now() }
});

var Page = mongoose.model('Page', schema);
function addPage(data) {
  let doc = new Page(data);
  return doc.save();
}

async function updatePage(_id, data) {
  let doc = await Page.findById(_id);
  if (doc) for (let key of data) doc[key] = data[key];
  return doc.update();
}

module.exports = { model: Page, addPage, updatePage };
