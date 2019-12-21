const { mongoose } = require('../services/MongoService');
const validator = require('validator');

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
  delay: Schema.Types.Boolean,
  repeat: {
    type: String,
    enum: ['weekly', 'monthly', 'none'],
    required: 'repeat must not null'
  },
  weekly: {
    type: [Schema.Types.Number],
    enum: [0, 1, 2, 3, 4, 5, 6]
  },
  monthly: {
    type: [Schema.Types.Number],
    enum: Array(31)
      .fill(0)
      .map((e, i) => i)
  },
  action: {
    type: String,
    enum: ['send_message', 'comment', 'publish_post'],
    required: 'action must not be null'
  },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  status: {
    type: String,
    enum: ['active', 'complete', 'canceled']
  },
  created: { type: Date, default: Date.now() }
});

var Job = mongoose.model('Job', schema);
function addJob(data) {
  let doc = new Job(data);
  return doc.save();
}

async function updateJob(_id, data) {
  let doc = await Job.findById(_id);
  if (doc) for (let key of data) doc[key] = data[key];
  return doc.update();
}

module.exports = { model: Job, addJob, updateJob };
