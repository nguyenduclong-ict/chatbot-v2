const router = require('express').Router();
// import model
const { updateMessagerProfile, deleteMessagerProfile } = _rq('utils/fb');
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

router.post('/sync', handleUpdateMessengerProfile);
router.delete('/sync', handleDeleteMessengerProfile);

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
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
 * @param { NextFuction } next
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
 * @param { NextFuction } next
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
 * @param { NextFuction } next
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
 * @param { NextFuction } next
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
 * @param { NextFuction } next
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
 * @param { NextFuction } next
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
 * @param { NextFuction } next
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
 * @param { NextFuction } next
 */

async function handleUpdateMessengerProfile(req, res, next) {
  const page = req.body;
  try {
    const task = [];
    // sync to facebook
    task.push(updateMessagerProfile(page.id, page.access_token, page.settings));
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
    return res.json(result);
  } catch (error) {
    _log('udpate messenger profile error : ', error);
    throw _createError(error.message, 400);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleDeleteMessengerProfile(req, res, next) {
  const { fields, pageId } = req.query;
  try {
    const page = await getPage({ ig: pageId, user_id: req.user._id });
    // sync to facebook
    const result = await deleteMessagerProfile(
      page.id,
      page.access_token,
      fields
    );
    return res.json(result);
  } catch (error) {
    _log('Delete messenger profile error : ', error.message);
    throw _createError(error.message, 400);
  }
}

// Export module
module.exports = router;
