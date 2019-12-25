const express = require('express');
const router = express.Router();
const Page = _rq('/models/Page');
const Customer = _rq('/models/Customer');
const { updateCustomer, getManyCustomer } = _rq('/providers/CustomerProvider');

const queue = _rq('utils/queue');
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
  if (!page) return next(Error.createError('Không tìm thấy page', 400));
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
    const { pageId, page, limit, name, tag_id } = req.query;
    const result = await getManyCustomer(
      {
        page_id: pageId,
        user_id: req.user._id,
        name: new RegExp(_escapeRegex(name)),
        tag_id
      },
      { page, limit }
    );
    return res.json(result);
  } catch (error) {
    _log(error);
    return next(Error.createError('Có lỗi xảy ra', 500));
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
    throw error;
  }
}
module.exports = router;
