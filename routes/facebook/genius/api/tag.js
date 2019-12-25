const router = require('express').Router();

// import model
const Tag = _rq('models/Tag');
const { getListTag, getTagById, createTag, updateTag, updateManyTag } = _rq(
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
  const { name, page, limit, page_id } = req.query;
  try {
    const query = _omit({
      name: new RegExp(name),
      user_id: req.user._id,
      page_id
    });
    const result = await getManyTag(query, _omit({ page, limit }));
    return res.json(result);
  } catch (error) {
    _log('get List Tag error : ', error);
    throw error;
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
    throw error;
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
  try {
    const result = await createTag(data);
    return res.json(result);
  } catch (error) {
    _log('get List Tag error : ', error);
    throw error;
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
    _log('get List Tag error : ', error);
    throw error;
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
    const result = await updateTag(
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
    throw error;
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
    const result = await deteleTag(id);
    return res.json(result);
  } catch (error) {
    _log('Delete List Tag error : ', error);
    throw error;
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
    throw error;
  }
}
module.exports = router;
