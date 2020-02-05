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
    ref: 'Flow'
  },
  delay: Schema.Types.Boolean,
  date_time: Date,
  date_time_detail: {
    year: Number,
    month: Number,
    day: Number,
    dayOfWeek: Number,
    hour: Number,
    minute: Number
  },
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
    type: String,
    enum: ['start_flow', 'comment', 'publish_post'],
    required: true
  },
  target: {
    send_to_all: {
      type: Boolean,
      default: true
    },
    send_to_tags: {
      type: [Schema.Types.ObjectId], // tag id
      default: []
    },
    send_to: {
      type: [Schema.Types.ObjectId], // id customer
      default: []
    },
    exclude: {
      type: [Schema.Types.ObjectId], // id customer
      default: []
    }
  },
  status: {
    type: String,
    enum: ['active', 'complete', 'doing', 'canceled', 'error']
  },
  created: { type: Date, default: Date.now() }
});

schema.pre('save', function(next, docs) {
  const now = new Date(this.date_time);
  const day = {
    dayOfWeek: now.getDay(),
    day: now.getDate(),
    month: now.getMonth(),
    year: now.getFullYear()
  };

  const time = {
    hour: now.getHours(),
    minute: now.getMinutes()
  };
  this.date_time_detail = {
    ...day,
    ...time
  };
  next();
});

schema.pre('findOneAndUpdate', function(next) {
  const updater = this.getUpdate();
  const now = new Date(updater.date_time);

  const day = {
    dayOfWeek: now.getDay(),
    day: now.getDate(),
    month: now.getMonth(),
    year: now.getFullYear()
  };

  const time = {
    hour: now.getHours(),
    minute: now.getMinutes()
  };

  updater.date_time_detail = {
    ...day,
    ...time
  };

  next();
});

var Job = mongoose.model('Job', schema);

module.exports = Job;
