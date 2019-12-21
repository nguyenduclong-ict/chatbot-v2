const { mongoose } = require('../services/MongoService');
const validator = require('validator');

var Schema = mongoose.Schema;
var schema = new Schema({
  id: String, //  Facebook id in Page convestion
  name: String,
  email: String,
  update_time: Date,
  page_id: {
    type: Schema.Types.ObjectId,
    ref: 'Page'
  },
  tag: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ],
  created: { type: Date, default: Date.now() }
});

var Customer = mongoose.model('Customer', schema);
function addCustomer(data) {
  let doc = new Customer(data);
  return doc.save();
}

async function updateCustomer(_id, data) {
  let doc = await Customer.findById(_id);
  if (doc) for (let key of data) doc[key] = data[key];
  return doc.update();
}

module.exports = { model: Customer, addCustomer, updateCustomer };
