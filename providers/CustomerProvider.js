const Customer = require('../models/Customer');
const { declareCRUD } = require('express-extra-tool').mongoose;
/**
 * Create customer
 * @param {*} data Customer data
 */
function createCustomer(data) {
  let doc = new Customer(data);
  return doc.save();
}

/**
 *
 * @param {*} query
 */
async function getListCustomer(query, { page, limit }) {
  query = _omit(query);
  const [list, count] = await Promise.all([
    Customer.find(query)
      .skip(pager.limit * pager.page)
      .limit(page)
      .lean(),
    Customer.count(query)
  ]);
  // pager
  const pager = {
    page: page,
    page_size: limit,
    total: count,
    total_page: Math.floor(count / page)
  };
  return { data: list || [], pager };
}

/**
 *
 * @param {*} query
 */
async function getCustomerById(id) {
  return Customer.findById(id).lean();
}

/**
 *
 * @param {*} query
 */
async function deleteCustomer(id) {
  return Customer.findByIdAndDelete(id);
}

/**
 *
 * @param {*} query
 */
async function deleteManyCustomer(conditions) {
  return Customer.deleteMany(conditions);
}

module.exports = {
  createCustomer,
  getListCustomer,
  getCustomerById,
  deleteCustomer,
  deleteManyCustomer,
  ...declareCRUD(Customer, 'Customer')
};
