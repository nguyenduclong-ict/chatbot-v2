const { mongoose } = require('../services/MongoService');
const { declareHook } = require(__dirroot + '/services/MongoService');
var Schema = mongoose.Schema;
var schema = new Schema({
  filename: {
    type: String,
    default: '',
    required: true
  },
  path: {
    type: String,
    default: '',
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  subOwner: [
    {
      type: Schema.Types.ObjectId,
      default: []
    }
  ],
  filetype: { type: String, default: '' },
  tags: [{ type: String, default: [] }],
  isPublic: {
    type: Boolean,
    default: true,
    required: true
  },
  created: { type: Date, default: Date.now() }
});

declareHook(schema, 'File');

var File = mongoose.model('File', schema);
module.exports = File;
