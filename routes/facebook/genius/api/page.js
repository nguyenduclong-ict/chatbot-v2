const router = require('express').Router();
// import model
const { updateMessagerProfile, deleteMessengerProfile } = _rq(
  'services/Facebook'
);
const { validatePersistentMenu, validateGreeting, validateGetStarted } = _rq(
  '/utils/facebook'
);
const {
  createPage,
  updatePage,
  updateManyPage,
  getManyPage,
  deletePage,
  getPage
} = _rq('providers/PageProvider');

// Middleware
router.use(_md('get-user-info'));

// route
router.get('/', handleGetListPage);
router.get('/:id', handleGetPage);

router.post('/', handleCreatePage);

router.put('/:id', handleUpdatePage);
router.put('/', handleUpdateManyPage);

router.delete('/:id', handleDeletePage);
router.post('/', handleDeleteManyPage);

router.post('/sync-on', handleUpdateMessengerProfile);
router.post('/sync-off', handleDisableMessengerProfile);

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleGetListPage(req, res, next) {
  let { query, options } = _validateQuery(req.query);
  console.log(query, options);
  try {
    query = _omit({
      ...query,
      name: new RegExp(query.name),
      user_id: req.user._id
    });
    const result = await getManyPage(query, options);
    return res.json(result);
  } catch (error) {
    _log('get List Page error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleGetPage(req, res, next) {
  const id = req.params.id;
  try {
    const result = await getPage({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('get List Page error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleCreatePage(req, res, next) {
  const data = req.body;
  data.user_id = req.user._id;
  try {
    const result = await createPage(data);
    return res.json(result);
  } catch (error) {
    _log('create Page error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleUpdatePage(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  try {
    const result = await updatePage({ _id: id }, data);
    return res.json(result);
  } catch (error) {
    _log('update Page error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleUpdateManyPage(req, res, next) {
  const { ids, data } = req.body;
  try {
    const result = await updateManyPage(
      {
        _id: {
          $in: ids
        }
      },
      data
    );
    return res.json(result);
  } catch (error) {
    _log('get List Page error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleDeletePage(req, res, next) {
  const id = req.params.id;
  try {
    const result = await deletePage({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('Delete List Page error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleDeleteManyPage(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyPage({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many Page error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleDeleteManyPage(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyPage({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many Page error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleUpdateMessengerProfile(req, res, next) {
  const { page, fields } = req.body;
  try {
    const task = [];
    const settings = _.pick(page.settings, fields);
    const m = [];

    if (fields.includes('persistent_menu') && !fields.includes('get_started')) {
      settings.get_started = { payload: 'abc' };
      fields.push('get_started');
    }

    if (fields.includes('get_started') && !fields.includes('persistent_menu')) {
      settings.persistent_menu = [];
      fields.push('persistent_menu');
    }

    fields.forEach(field => {
      if (field === 'persistent_menu') {
        settings[field].map(item => {
          item.call_to_actions.map((button, index) => {
            if (button.type === 'web_url') {
              delete button.payload;
              item.call_to_actions[index] = _.pick(button, [
                'title',
                'url',
                'webview_height_ratio',
                'type'
              ]);
            } else {
              item.call_to_actions[index] = _.pick(button, [
                'title',
                'type',
                'payload'
              ]);
            }
          });
        });
        if (!validatePersistentMenu(settings[field])) {
          m.push('Persistent Menu không hợp lệ');
        }
      }

      if (field === 'greeting') {
        if (!validateGreeting(settings[field])) {
          m.push('Tin nhắn chào mừng không hợp lệ');
        }
      }

      if (field === 'get_started') {
        if (!validateGetStarted(settings[field])) {
          m.push('Nút bắt đầu chào mừng không hợp lệ');
        }
      }
    });
    if (m.length > 0) {
      return next(_createError('Cài đặt không hợp lệ', 500, m));
    }
    fields.forEach(field => {
      _.set(page.settings, field, settings[fields]);
    });
    _log(settings);
    // sync to facebook
    task.push(updateMessagerProfile(page.id, page.access_token, settings));
    task.push(
      updatePage(
        {
          _id: page._id
        },
        page
      )
    );
    const result = await Promise.all(task);
    console.log(result);
    if (!result[0] || !result[1]) {
      return next(_createError('Lỗi', 500, result));
    } else {
      return res.json(result);
    }
  } catch (error) {
    _log('udpate messenger profile error : ', error);
    next(_createError(error.message, 400, error));
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleDisableMessengerProfile(req, res, next) {
  const { fields, page } = req.body;

  if (fields.includes('persistent_menu') || fields.includes('get_started')) {
    fields = fields.filter(
      field => field !== 'persistent_menu' && field !== 'get_started'
    );
    fields.push('get_started', 'persistent_menu');
  }

  try {
    fields.forEach(field => {
      page.settings['active_' + field] = false;
    });
    const task = [
      deleteMessengerProfile(page.id, page.access_token, fields),
      updatePage({ _id: page._id }, page)
    ];
    // sync to facebook
    const results = await Promise.all(task);
    _log(results);
    if (results[0].error || !results[1]) {
      return next(_createError('Lỗi', 500, { data: results }));
    } else {
      return res.json(results);
    }
  } catch (error) {
    _log('Delete messenger profile error : ', error.message);
    throw _createError(error.message, 400);
  }
}

// Export module
module.exports = router;
