const router = require('express').Router();
// import model
const Tag = _rq('models/Tag');
const { createTag, updateTag, updateManyTag, getManyTag, deleteTag } = _rq(
  'providers/TagProvider'
);

// Middleware
router.use(_md('get-user-info'));

// route
router.get('/', handleGetListTag);
router.get('/:id', handleGetTag);

router.post('/', handleCreateTag);

router.put('/:id', handleUpdateTag);
router.put('/', handleUpdateManyTag);

router.delete('/:id', handleDeleteTag);
router.post('/', handleDeleteManyTag);

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleGetListTag(req, res, next) {
  let { query, options } = _validateQuery(req.query);
  console.log(query, options);
  try {
    query = _omit({
      ...query,
      name: new RegExp(query.name),
      user_id: req.user._id
    });
    const result = await getManyTag(query, options);
    return res.json(result);
  } catch (error) {
    _log('get List Tag error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleGetTag(req, res, next) {
  const id = req.params.id;
  try {
    const result = await getTag({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('get List Tag error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleCreateTag(req, res, next) {
  const data = req.body;
  data.user_id = req.user._id;
  try {
    const result = await createTag(data);
    return res.json(result);
  } catch (error) {
    _log('create Tag error : ', error);
    return next(error)
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleUpdateTag(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  try {
    const result = await updateTag({ _id: id }, data);
    return res.json(result);
  } catch (error) {
    _log('update Tag error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleUpdateManyTag(req, res, next) {
  const { ids, data } = req.body;
  try {
    const result = await updateManyTag(
      {
        _id: {
          $in: ids
        }
      },
      data
    );
    return res.json(result);
  } catch (error) {
    _log('get List Tag error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleDeleteTag(req, res, next) {
  const id = req.params.id;
  try {
    const result = await deleteTag({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('Delete List Tag error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleDeleteManyTag(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyTag({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many Tag error : ', error);
    next(error);
  }
}

// Export module
module.exports = router;
