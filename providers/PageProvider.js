const Page = require('../models/Page');
const { declareCRUD } = require('express-extra-tool').mongoose;

function addPage(data) {
  let doc = new Page(data);
  return doc.save();
}

async function updatePage(conditions, data, create = false) {
  return Page.updateOne(conditions, data, { upsert: create });
}

async function updateManyPage(conditions, data, create = false) {
  return Page.updateMany(conditions, data, { upsert: create });
}

async function listPageOfUser(userId) {
  let list = await Page.find({ user_id: userId, hidden: false }).lean();
  return list || [];
}

module.exports = {
  addPage,
  updatePage,
  listPageOfUser,
  updateManyPage,
  ...declareCRUD(Page, 'Page')
};
