const router = require('express').Router();
// import model
const {
  createApp,
  updateApp,
  updateManyApp,
  getManyApp,
  deleteApp,
  getApp
} = _rq('/providers/Example/AppProvider');

// Middleware
router.use(..._md(['get-user-info', 'admin-role']));

// route
router.get('/', handleGetListApp);
router.get('/:id', handleGetApp);

router.post('/', handleCreateApp);

router.put('/:id', handleUpdateApp);
router.put('/', handleUpdateManyApp);

router.delete('/:id', handleDeleteApp);
router.post('/', handleDeleteManyApp);

/**
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleGetListApp(req, res, next) {
  let { query, options } = _validateQuery(req.query);
  console.log(query, options);
  try {
    query = _omit({
      ...query,
      name: new RegExp(query.name)
    });
    const result = await getManyApp(query, options);
    return res.json(result);
  } catch (error) {
    _log('get List App error : ', error);
    next(error);
  }
}

/**
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleGetApp(req, res, next) {
  const id = req.params.id;
  try {
    const result = await getApp({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('get List App error : ', error);
    next(error);
  }
}

/**
 
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleCreateApp(req, res, next) {
  const data = req.body;
  data.user_id = req.user._id;
  try {
    const result = await createApp(data);
    return res.json(result);
  } catch (error) {
    _log('create App error : ', error);
    next(error);
  }
}

/**
 
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleUpdateApp(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  try {
    const result = await updateApp({ _id: id }, data);
    return res.json(result);
  } catch (error) {
    _log('update App error : ', error);
    next(error);
  }
}

/**
 
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleUpdateManyApp(req, res, next) {
  const { ids, data } = req.body;
  try {
    const result = await updateManyApp(
      {
        _id: {
          $in: ids
        }
      },
      data
    );
    return res.json(result);
  } catch (error) {
    _log('get List App error : ', error);
    next(error);
  }
}

/**
 
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleDeleteApp(req, res, next) {
  const id = req.params.id;
  try {
    const result = await deleteApp({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('Delete List App error : ', error);
    next(error);
  }
}

/**
 
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleDeleteManyApp(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyApp({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many App error : ', error);
    next(error);
  }
}

/**
 
 * @param { router.request } req
 * @param { router.response } res
 * @param { NextFunction } next
 */

async function handleDeleteManyApp(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyApp({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many App error : ', error);
    next(error);
  }
}
module.exports = router;
