const Page = require('../models/Page');

function addPage(data) {
  let doc = new Page(data);
  return doc.save();
}

async function updatePage(conditions, data, create = false) {
  let doc = await Page.findOne(conditions);
  _log(conditions, data, doc);
  if (doc) {
    for (let key in data) doc[key] = data[key];
    return Page.updateOne({ _id: doc._id }, data);
  } else if (create) {
    return addPage(data);
  } else {
    throw Error('Không tìm thấy Page');
  }
}

async function listPageOfUser(userId) {
  let list = await Page.find({ user_id: userId }).lean();
  return list || [];
}

module.exports = { addPage, updatePage, listPageOfUser };
