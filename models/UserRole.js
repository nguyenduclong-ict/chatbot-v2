const mongoose = require('mongoose');

var Schema = mongoose.Schema;
var schema = new Schema({
  value: {
    type: String,
    unique: true,
    required: true
  },
  level: {
    type: Number,
    default: 1
  },
  name: String,
  created: { type: Date, default: Date.now() }
});

var UserRole = mongoose.model('UserRole', schema);

module.exports = UserRole;
