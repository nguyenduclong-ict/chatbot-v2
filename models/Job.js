const mongoose = require('mongoose');
const { declareHook } = require('express-extra-tool').mongoose;

var Schema = mongoose.Schema;
var schema = new Schema({
  title: String,
  date_time: Date,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  page_id: {
    type: Schema.Types.ObjectId,
    ref: 'Page'
  },
  flow_id: {
    type: Schema.Types.ObjectId,
    ref: 'Page'
  },
  delay: Schema.Types.Boolean,
  delay_time: Date,
  repeat: {
    type: String,
    enum: ['weekly', 'monthly', 'none'],
    required: 'repeat must not null'
  },
  weekly: {
    type: [String],
    enum: [0, 1, 2, 3, 4, 5, 6]
  },
  monthly: {
    type: [String],
    enum: Array(31)
      .fill(0)
      .map((e, i) => i)
  },
  action: {
    type: Schema.Types.ObjectId, // tag with type = 'job'
    ref: 'Tag',
    required: 'action must not be null'
  },
  target: {
    type: {
      send_to_all: Boolean,
      send_to_tags: [Schema.Types.ObjectId],
      send_to: [Schema.Types.ObjectId]
    }
  },
  status: {
    type: String,
    enum: ['active', 'complete', 'doing', 'canceled']
  },
  created: { type: Date, default: Date.now() }
});

var Job = mongoose.model('Job', schema);
declareHook(schema, 'Job');

module.exports = Job;
