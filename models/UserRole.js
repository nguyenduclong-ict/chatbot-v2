const { mongoose } = require('../services/MongoService');
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

/**
 *
 * @param { { value : string, name : string } }  param0
 */
function addUserRole({ value, name }) {
  let userRole = new UserRole({ value, name });
  return userRole.save();
}

module.exports = { ...UserRole, addUserRole, _instance: UserRole };
