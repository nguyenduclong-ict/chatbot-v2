const express = require('express');
const router = express.Router();
// import model
const {
  createJob,
  updateJob,
  updateManyJob,
  getManyJob,
  deleteJob,
  getJob
} = _rq('providers/JobProvider');

// Middleware
router.use(_md('get-user-info'));

// route
router.get('/', handleGetListJob);
router.get('/:id', handleGetJob);

router.post('/', handleCreateJob);

router.put('/:id', handleUpdateJob);
router.put('/', handleUpdateManyJob);

router.delete('/:id', handleDeleteJob);
router.post('/', handleDeleteManyJob);

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleGetListJob(req, res, next) {
  let { query, options } = _validateQuery(req.query);
  console.log(query, options);
  try {
    query = _omit({
      ...query,
      name: new RegExp(query.name),
      user_id: req.user._id
    });
    const result = await getManyJob(query, options);
    return res.json(result);
  } catch (error) {
    _log('get List Job error : ', error);
    throw error;
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleGetJob(req, res, next) {
  const id = req.params.id;
  try {
    const result = await getJob({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('get List Job error : ', error);
    throw error;
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleCreateJob(req, res, next) {
  const data = req.body;
  data.user_id = req.user._id;
  try {
    const result = await createJob(data);
    return res.json(result);
  } catch (error) {
    _log('create Job error : ', error);
    throw error;
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleUpdateJob(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  try {
    const result = await updateJob({ _id: id }, data);
    return res.json(result);
  } catch (error) {
    _log('update Job error : ', error);
    throw error;
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleUpdateManyJob(req, res, next) {
  const { ids, data } = req.body;
  try {
    const result = await updateManyJob(
      {
        _id: {
          $in: ids
        }
      },
      data
    );
    return res.json(result);
  } catch (error) {
    _log('get List Job error : ', error);
    throw error;
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleDeleteJob(req, res, next) {
  const id = req.params.id;
  try {
    const result = await deleteJob({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('Delete List Job error : ', error);
    throw error;
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleDeleteManyJob(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyJob({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many Job error : ', error);
    throw error;
  }
}

/**
 * Crawl all user facebook
 * @param { express.request } req
 * @param { express.response } res
 * @param { NextFuction } next
 */

async function handleDeleteManyJob(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyJob({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many Job error : ', error);
    throw error;
  }
}

// Export module
module.exports = router;
