const { mongoose } = require('../services/MongoService');
const validator = require('validator');

var Schema = mongoose.Schema;
var schema = new Schema({
  name: String,
  address: String,
  phone: {
    type: String,
    validate: {
      validator: v => {
        return validator.isMobilePhone(v);
      }
    }
  },
  facebook_ids: {
    type: Schema.Types.Array,
    default: []
  },
  created: { type: Date, default: Date.now() }
});
var UserInfo = mongoose.model('UserInfo', schema);
function addUserInfo(data) {
  let info = new UserInfo(data);
  return info.save();
}

async function updateUserInfo(_id, data) {
  let info = await UserInfo.findById(_id);
  if (info) for (let key of data) info[key] = data[key];
  return info.update();
}
module.exports = { ...UserInfo, addUserInfo, updateUserInfo };
