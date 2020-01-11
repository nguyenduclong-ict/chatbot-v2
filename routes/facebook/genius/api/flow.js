const express = require('express');
const router = express.Router();
// import model
const {
  createFlow,
  updateFlow,
  updateManyFlow,
  getManyFlow,
  deleteFlow,
  getFlow
} = _rq('providers/FlowProvider');
const { deleteManyBlock, createBlock, getBlock } = _rq(
  'providers/BlockProvider'
);

// Middleware
router.use(_md('get-user-info'));

// route
router.get('/', handleGetListFlow);
router.get('/:id', handleGetFlow);

router.post('/', handleCreateFlow);

router.put('/:id', handleUpdateFlow);
router.put('/', handleUpdateManyFlow);

router.delete('/:id', handleDeleteFlow);
router.post('/', handleDeleteManyFlow);

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleGetListFlow(req, res, next) {
  let { query, options } = _validateQuery(req.query);
  console.log(query, options);
  try {
    query = _omit({
      ...query,
      name: new RegExp(query.name),
      user_id: req.user._id
    });
    const result = await getManyFlow(query, options);
    return res.json(result);
  } catch (error) {
    _log('get List Flow error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleGetFlow(req, res, next) {
  const id = req.params.id;
  try {
    const result = await getFlow({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('get List Flow error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleCreateFlow(req, res, next) {
  const data = req.body;
  data.user_id = req.user._id;
  try {
    const result = await createFlow(data);
    await createBlock({
      flow_id: result._id,
      is_start: true,
      type: 'message',
      name: 'Tin nhắn bắt đầu'
    });
    return res.json(result);
  } catch (error) {
    _log('create Flow error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleUpdateFlow(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  try {
    const result = await updateFlow({ _id: id }, data);
    return res.json(result);
  } catch (error) {
    _log('update Flow error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleUpdateManyFlow(req, res, next) {
  const { ids, data } = req.body;
  try {
    const result = await updateManyFlow(
      {
        _id: {
          $in: ids
        }
      },
      data
    );
    return res.json(result);
  } catch (error) {
    _log('get List Flow error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleDeleteFlow(req, res, next) {
  const id = req.params.id;
  try {
    const result = await Promise.all([
      deleteFlow({ _id: id }),
      deleteManyBlock({ flow_id: id })
    ]);
    return res.json(result);
  } catch (error) {
    _log('Delete List Flow error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleDeleteManyFlow(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyFlow({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many Flow error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFunction } next
 */

async function handleDeleteManyFlow(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyFlow({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many Flow error : ', error);
    next(error);
  }
}

// Export module
module.exports = router;
