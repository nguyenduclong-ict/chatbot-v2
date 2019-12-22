const { mongoose } = require('../services/MongoService');
const validator = require('validator');

var Schema = mongoose.Schema;
var schema = new Schema({
  name: String,
  access_token: String,
  id: String,
  type: String,
  token_expires: Date,
  persistent_menu: Schema.Types.Map,
  get_started: Object,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }, // user id ref
  picture: String,
  token_expired: { type: Date, default: Date.now() },
  subscribed_fields: [{ type: String }],
  user_facebook_id: String, // map to user info
  created: { type: Date, default: Date.now() }
});

var Page = mongoose.model('Page', schema);

module.exports = Page;
