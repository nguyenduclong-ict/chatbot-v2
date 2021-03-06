const express = require('express');
const router = express.Router();
const Page = _rq('/models/Page');
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
 
 * @param {express.request} req
 * @param {express.response} res
 * @param {NextFunction} next
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
    limit: 1000
  };
  _log(params);
  const task = queue
    .create('crawl-customer', params)
    .removeOnComplete(true)
    .save(error => {
      if (!error) {
        res.json({ status: 'doing' });
      } else {
        res.status(500).send('Có lỗi');
      }
    });

  task.on('complete', () => {
    // job complete
    _log('crawl customer success');
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
 
 * @param { express.request } req
 * @param {express.response} res
 * @param {NextFunction} next
 */

async function getListCustomer(req, res, next) {
  try {
    const { query, options } = _validateQuery(req.query);
    if (query.tags) {
      query.tags = { $in: query.tags };
    }
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
 
 * @param { express.request } req
 * @param {express.response} res
 * @param {NextFunction} next
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
