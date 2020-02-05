const mongoose = require('mongoose');
const { declareHook } = require('express-extra-tool').mongoose;

var Schema = mongoose.Schema;
var schema = new Schema({
  name: String,
  access_token: String,
  id: String,
  type: String,
  token_expires: Date,
  settings: {
    type: Schema.Types.Map,
    default: {
      get_started: {
        payload: 'SETTING.GET_STARTED'
      },
      persistent_menu: [],
      greeting: [
        {
          locale: 'default',
          text: 'Xin chào {{user_full_name}}, rất vui được hỗ trợ bạn!'
        }
      ]
    }
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }, // user id ref
  picture: String,
  link: String,
  hidden: { type: Boolean, default: false },
  is_active: { type: Boolean, default: false },
  token_expired: { type: Date, default: Date.now() },
  subscribed_fields: [{ type: String }],
  user_facebook_id: String, // map to user info
  created: { type: Date, default: Date.now() }
});

declareHook(schema, 'Page');
const Page = mongoose.model('Page', schema);
module.exports = Page;
