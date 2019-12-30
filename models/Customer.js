const mongoose = require('mongoose');
const { declareHook } = require('express-extra-tool').mongoose;

var Schema = mongoose.Schema;
var schema = new Schema({
  id: String, //  Facebook id in Page convestion
  type: {
    type: String,
    enum: ['facebook', 'zalo']
  },
  name: String,
  email: String,
  updated_time: Date,
  page_id: {
    type: Schema.Types.ObjectId,
    ref: 'Page'
  },
  page_id_facebook: String,
  link: String,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ],
  image: String,
  can_send: {
    // Người dùng có muốn nhận tin hay không
    type: Boolean,
    default: true
  },
  created: { type: Date, default: Date.now() }
});

declareHook(schema, 'Customer');
const Customer = mongoose.model('Customer', schema);

module.exports = Customer;
