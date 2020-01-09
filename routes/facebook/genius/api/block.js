const express = require('express');
const router = express.Router();
// import model
const {
  createBlock,
  updateBlock,
  updateManyBlock,
  getManyBlock,
  deleteBlock,
  getBlock
} = _rq('providers/BlockProvider');

// Middleware
router.use(_md('get-user-info'));

// route
router.get('/', handleGetListBlock);
router.post('/list', handlePostQueryBlock);
router.get('/:id', handleGetBlock);

router.post('/', handleCreateBlock);

router.put('/:id', handleUpdateBlock);
router.put('/', handleUpdateManyBlock);

router.delete('/:id', handleDeleteBlock);
router.post('/', handleDeleteManyBlock);

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleGetListBlock(req, res, next) {
  let { query, options } = _validateQuery(req.query);
  // Cast data type
  query.is_draft = Boolean(query.is_draft);
  //
  try {
    query = _omit({
      ...query
    });
    console.log(query, options);
    const result = await getManyBlock(query, options);
    return res.json(result);
  } catch (error) {
    _log('get List Block error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handlePostQueryBlock(req, res, next) {
  let { query, options } = _validateQuery(req.body);
  // Cast data type
  try {
    query = _omit({
      ...query
    });
    console.log(query, options);
    const result = await getManyBlock(query, options);
    return res.json(result);
  } catch (error) {
    _log('get List Block error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleGetBlock(req, res, next) {
  const id = req.params.id;
  try {
    const result = await getBlock({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('get List Block error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleCreateBlock(req, res, next) {
  const data = req.body;
  data.user_id = req.user._id;
  try {
    const result = await createBlock(data);
    return res.json(result);
  } catch (error) {
    _log('create Block error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleUpdateBlock(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  const task = [];
  if (data.is_start) {
    task.push(
      updateManyBlock(
        {
          _id: {
            $ne: data._id
          },
          flow_id: data.flow_id,
          is_draft: true
        },
        {
          is_start: false
        }
      )
    );
  }
  try {
    task.push(updateBlock({ _id: id }, data));
    const [result] = await Promise.all(task);
    return res.json(result);
  } catch (error) {
    _log('update Block error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleUpdateManyBlock(req, res, next) {
  const { ids, data } = req.body;
  try {
    const result = await updateManyBlock(
      {
        _id: {
          $in: ids
        }
      },
      data
    );
    return res.json(result);
  } catch (error) {
    _log('get List Block error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleDeleteBlock(req, res, next) {
  const id = req.params.id;
  try {
    const result = await deleteBlock({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('Delete List Block error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleDeleteManyBlock(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyBlock({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many Block error : ', error);
    next(error);
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleDeleteManyBlock(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyBlock({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many Block error : ', error);
    next(error);
  }
}

// Export module
module.exports = router;
