const { mongoose } = require('../services/MongoService');
const validator = require('validator');

var Schema = mongoose.Schema;
var schema = new Schema({
  title: String,
  page_id: {
    type: Schema.Types.ObjectId,
    ref: 'Page'
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: String,
  customers: [{ type: Schema.Types.ObjectId, ref: 'Customer' }],
  customer_tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  send_to_all: Schema.Types.Boolean,
  message: Schema.Types.Map,
  created: { type: Date, default: Date.now() }
});

var Message = mongoose.model('Message', schema);
function addMessage(data) {
  let doc = new Message(data);
  return doc.save();
}

async function updateMessage(_id, data) {
  let doc = await Message.findById(_id);
  if (doc) for (let key of data) doc[key] = data[key];
  return doc.update();
}

module.exports = { model: Message, addMessage, updateMessage };
