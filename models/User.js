const mongoose = require('mongoose');
const validator = require('validator');
var Schema = mongoose.Schema;

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

module.exports = User;
