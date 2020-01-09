const router = require('express').Router();

// import model
const {
  createTestPage,
  updateTestPage,
  updateManyTestPage,
  getManyTestPage,
  deleteTestPage,
  getTestPage
} = _rq('/providers/Example/TestPageProvider');

// Middleware
router.use(..._md(['get-user-info', 'admin-role']));

// route
router.get('/', handleGetListTestPage);
router.get('/:id', handleGetTestPage);

router.post('/', handleCreateTestPage);

router.put('/:id', handleUpdateTestPage);
router.put('/', handleUpdateManyTestPage);

router.delete('/:id', handleDeleteTestPage);
router.post('/', handleDeleteManyTestPage);

/**
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleGetListTestPage(req, res, next) {
  let { query, options } = _validateQuery(req.query);
  console.log(query, options);
  try {
    query = _omit({
      ...query,
      name: new RegExp(query.name)
    });
    const result = await getManyTestPage(query, options);
    return res.json(result);
  } catch (error) {
    _log('get List TestPage error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleGetTestPage(req, res, next) {
  const id = req.params.id;
  try {
    const result = await getTestPage({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('get List TestPage error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleCreateTestPage(req, res, next) {
  const data = req.body;
  data.user_id = req.user._id;
  try {
    const result = await createTestPage(data);
    return res.json(result);
  } catch (error) {
    _log('create TestPage error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleUpdateTestPage(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  try {
    const result = await updateTestPage({ _id: id }, data);
    return res.json(result);
  } catch (error) {
    _log('update TestPage error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleUpdateManyTestPage(req, res, next) {
  const { ids, data } = req.body;
  try {
    const result = await updateManyTestPage(
      {
        _id: {
          $in: ids
        }
      },
      data
    );
    return res.json(result);
  } catch (error) {
    _log('get List TestPage error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleDeleteTestPage(req, res, next) {
  const id = req.params.id;
  try {
    const result = await deleteTestPage({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('Delete List TestPage error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleDeleteManyTestPage(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyTestPage({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many TestPage error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleDeleteManyTestPage(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyTestPage({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many TestPage error : ', error);
    next(error);
  }
}

// Export module
module.exports = router;
