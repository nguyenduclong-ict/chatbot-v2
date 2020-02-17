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
  crawl_customer_time: {
    type: Number,
    default: 0,
    enum: [5, 10, 15, 30, 45]
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }, // user id ref
  picture: {
    type: String,
    default: ''
  },
  link: { type: String, default: '' },
  hidden: { type: Boolean, default: false },
  is_active: { type: Boolean, default: false },
  token_expired: { type: Date, default: Date.now() },
  subscribed_fields: [{ type: String }],
  user_facebook_id: { type: String, default: '' }, // map to user info
  app_id: { type: String, default: '' },
  created: { type: Date, default: Date.now() }
});

declareHook(schema, 'Page');
const Page = mongoose.model('Page', schema);
module.exports = Page;
