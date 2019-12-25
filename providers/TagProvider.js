const Tag = require('../models/Tag');
const { declareCRUD } = require('../services/MongoService');
// function createTag(data) {
//   let doc = new Tag(data);
//   return doc.save();
// }

// async function updateTag(conditions, data, create = false) {
//   return Tag.updateOne(conditions, data, { upsert: create });
// }

// async function updateManyTag(conditions, data, create = false) {
//   return Tag.updateMany(conditions, data, { upsert: create });
// }

// /**
//  *
//  * @param {*} query
//  */
// async function getListTag({ name, page, limit, user_id, page_id }) {
//   const query = { name, user_id, page_id };
//   const [list, count] = await Promise.all([
//     Tag.find(query)
//       .skip(limit * page)
//       .limit(page)
//       .lean(),
//     Tag.count(query)
//   ]);
//   // pager
//   const pager = {
//     page: page,
//     page_size: limit,
//     total: count,
//     total_page: Math.floor(count / page)
//   };
//   return { data: list || [], pager };
// }

// /**
//  *
//  * @param {*} query
//  */
// async function getTagById(id) {
//   return Tag.findById(id).lean();
// }

// /**
//  *
//  * @param {*} query
//  */
// async function deleteTag(id) {
//   return Tag.findByIdAndDelete(id);
// }

// /**
//  *
//  * @param {*} query
//  */
// async function deleteManyTag(conditions) {
//   return Tag.deleteMany(conditions);
// }

module.exports = {
  //   createTag,
  //   updateTag,
  //   updateManyTag,
  //   getListTag,
  //   getTagById,
  //   deleteTag,
  //   deleteManyTag,
  ...declareCRUD(Tag, 'Tag')
};
