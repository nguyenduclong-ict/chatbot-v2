const express = require('express');
const router = express.Router();
const Page = _rq('/models/Page');
const Customer = _rq('/models/Customer');
const { updateCustomer, getManyCustomer } = _rq('/providers/CustomerProvider');

const queue = _rq('services/Queue');
const { socketio } = _rq('services/Socket.IO.js');

// defind middleware for current route
router.middlewares = ['get-user-info'];

// router
router.post('/crawl-customer', postCrawlCustomer);
router.get('/list-customer', getListCustomer);
router.put('/update', handleUpdateManyCustomer);

/**
 * Crawl all user facebook
 * @param {express.request} req
 * @param {express.response} res
 * @param {NextFuction} next
 */
async function postCrawlCustomer(req, res, next) {
  const { pageId } = req.body;
  const page = await Page.findOne({ id: pageId, user_id: req.user._id }).lean();
  if (!page) return next(_createError('Không tìm thấy page', 400));
  const params = {
    user_id: req.user._id,
    page_id_facebook: pageId,
    page_id: page._id,
    access_token: page.access_token,
    limit: 500
  };
  res.json({ status: 'doing' });
  const task = queue.create('crawl-customer', params).save();
  task.on('complete', () => {
    // job complete
    _log('crawl customer for page ', pageId, 'complete');
    socketio()
      .to(page._id)
      .emit('notify', {
        type: 'success',
        action: 'crawl-customer',
        message: 'Thu thập thông tin khách hàng thành công!'
      });
  });
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param {express.response} res
 * @param {NextFuction} next
 */

async function getListCustomer(req, res, next) {
  try {
    const { query, options } = _validateQuery(req.query);
    _log(query, options);
    const result = await getManyCustomer(
      {
        ...query,
        user_id: req.user._id,
        name: new RegExp(_escapeRegex(query.name))
      },
      options
    );
    return res.json(result);
  } catch (error) {
    _log(error);
    return next(_createError('Có lỗi xảy ra', 500));
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param {express.response} res
 * @param {NextFuction} next
 */
async function handleUpdateManyCustomer(req, res, next) {
  try {
    const customers = req.body;
    const tasks = customers.map(customer => {
      _log(customer);
      return updateCustomer({ _id: customer._id }, _clean(customer, '_id'));
    });
    const rs = await Promise.all(tasks);

    return res.json(rs);
  } catch (error) {
    next(error);
  }
}

// Export module
module.exports = router;
