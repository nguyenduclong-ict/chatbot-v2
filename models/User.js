const { mongoose } = require('../services/MongoService');
const validator = require('validator');
const UserRole = require('./UserRole')._instance;
var Schema = mongoose.Schema;
const { omitBy } = require('lodash');
/**
 * Defind model
 */

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
  facebook_accounts: [{ type: Schema.Types.Map }],
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

async function addUser({
  email,
  password,
  name,
  facebook_accounts,
  address,
  phone,
  roles,
  username
}) {
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
      name,
      address,
      phone,
      facebook_accounts,
      is_block: isBlock,
      roles: docs.map(r => r._id)
    };
    if (email) data.email = email;
    let user = new User(data);
    // add user info
    return user.save();
  } catch (error) {
    _log('add user error', error);
  }
}

/**
 * Get User Info
 * @param {*} param0
 */

async function getUser(query) {
  query = _omit(query, [null, undefined]);
  if (query === {}) return null;
  let user = await User.findOne(query)
    .populate('roles')
    .lean();
  if (user) user.roles = user.roles.map(e => e.value);
  return user;
}

/**
 * Update user
 * @param {*} _id user id
 * @param {*} param1
 */
async function updateUser(_id, data) {
  let user = await User.findById(_id);
  if (!user) return false;
  data = _omit(data, [null, undefined]);
  const facebook_accounts = data.facebook_accounts || [];
  user['facebook_accounts'] = user['facebook_accounts'] || [];
  facebook_accounts.forEach(e => {
    let index = user['facebook_accounts'].findIndex(f => f.get('id') === e.id);
    _log(index);
    if (index >= 0) {
      user['facebook_accounts'][index] = e;
    } else {
      user['facebook_accounts'].push(e);
    }
  });
  Object.keys(data).forEach(key => {
    if (key !== 'facebook_accounts') {
      user[key] = data[key];
    }
  });
  // Update User Info
  return User.updateOne({ _id: user._id }, user.toObject());
}

module.exports = { model: User, addUser, updateUser, getUser };
