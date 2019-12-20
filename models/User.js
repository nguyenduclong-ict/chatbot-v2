const { mongoose } = require('../services/MongoService');
const validator = require('validator');
const UserInfo = require('./UserInfo');
const UserRole = require('./UserRole')._instance;
var Schema = mongoose.Schema;
var schema = new Schema({
  password: String,
  username: {
    type: String,
    minlength: 4,
    unique: true,
    required: true
  },
  email: {
    type: String,
    validate: {
      validator: v => {
        return validator.isEmail(v);
      }
    },
    unique: true
  },
  roles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'UserRole'
    }
  ],
  info: {
    type: Schema.Types.ObjectId,
    ref: 'UserInfo',
    required: false
  },
  is_block: {
    type: Boolean,
    default: true,
    required: true
  },
  created: { type: Date, default: Date.now() }
});

var User = mongoose.model('User', schema);

/**
 *
 * @param {{email, password, info, role, username }} param0
 */
async function addUser({ email, password, info, roles, username }) {
  try {
    // check user roles
    let isBlock = false;
    const docs = await UserRole.find({
      value: {
        $in: roles
      }
    });
    if (docs.length < roles.lenght) throw new Error('Roles not exits');
    if (docs.some(e => e.level === 0)) isBlock = true;
    const data = {
      username,
      password,
      is_block: isBlock,
      roles: docs.map(r => r._id)
    };
    if (email) data.email = email;
    let user = new User(data);
    // add user info
    if (info) {
      let userInfo = await UserInfo.addUserInfo(info);
      user.info = userInfo._id;
    }
    return user.save();
  } catch (error) {
    _log('add user error', error);
  }
}

async function getUser({ _id, email, username }) {
  let query = {};
  if (_id) query._id = _id;
  if (email) query.email = email;
  if (username) query.username = username;
  if (query === {}) return null;
  let user = await User.findOne(query)
    .populate('info')
    .populate('roles')
    .lean();
  user.role = user.roles.map(e => e.value);
  return user;
}

async function updateUser(_id, { role, isBlock, password, info }) {
  let user = await User.findById(_id);
  let update = [];
  if (!user) return false;
  if (password) user.password = password;
  if (isBlock) user.is_block = isBlock;
  if (roles) user.roles = roles;
  // Update User Info
  if (info) {
    if (user.info) update.push(UserInfo.updateUserInfo(user.info, info));
    else
      await UserInfo.addUserInfo(info).then(doc => {
        user.info = doc._id;
      });
  }
  update.push(user.update());
  let result = await Promise.all(update);
  return result;
}

module.exports = { model: User, addUser, updateUser, getUser };
