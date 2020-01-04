const mongoose = require('mongoose');
const { declareHook } = require('express-extra-tool').mongoose;

var Schema = mongoose.Schema;
var schema = new Schema({
  name: String,
  flow_id: {
    type: Schema.Types.ObjectId,
    ref: 'Flow'
  },
  type: {
    type: String,
    enum: ['message', 'action', 'condition', 'delay']
  },
  content: {
    type: Schema.Types.Mixed,
    default: {
      cards: [],
      conditions: [],
      actions: []
    }
  },
  position: {
    type: {
      x: Number,
      y: Number
    },
    default: {
      x: Math.floor(Math.random() * 1000),
      y: Math.floor(Math.random() * 1000)
    }
  },
  has_next_block: {
    type: Boolean,
    default: false
  },
  next_block_id: {
    type: Schema.Types.ObjectId,
    ref: 'Block',
    default: null
  },
  next_flow_id: {
    type: Schema.Types.ObjectId,
    ref: 'Flow'
  },
  is_draft: {
    type: Boolean,
    default: true
  },
  publish_id: {
    type: Schema.Types.ObjectId,
    ref: 'Block'
  },
  is_start: {
    type: Boolean,
    default: false
  },
  created: { type: Date, default: Date.now() }
});

var Block = mongoose.model('Block', schema);
declareHook(schema, 'Block');

module.exports = Block;
