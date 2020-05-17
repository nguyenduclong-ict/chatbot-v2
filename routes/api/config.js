const express = require('express');
const router = express.Router();
// import model
const {
  createConfig,
  updateConfig,
  updateManyConfig,
  getManyConfig,
  deleteConfig,
  getConfig
} = _rq('providers/ConfigProvider');

const { getApp, createApp } = _rq('providers/AppProvider');

// Middleware
router.use(_md('get-user-info'), _md('admin-role'));

// route
router.get('/', handleGetListConfig);
router.get('/:id', handleGetConfig);

router.post('/', handleCreateConfig);

router.put('/:id', handleUpdateConfig);
router.put('/', handleUpdateManyConfig);

router.delete('/:id', handleDeleteConfig);
router.post('/', handleDeleteManyConfig);

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleGetListConfig(req, res, next) {
  let { query, options } = _validateQuery(req.query);
  _log(query, options);
  try {
    const results = await getManyConfig(query, { options, pagination: false });

    let appConfig = results.find(c => c.key === 'app-main-id');
    if (!appConfig) {
      let a = await createApp({
        app_id: '12345',
        verify_token: 'abc',
        app_secret: '12345',
        server_url: 'https://',
        type: 'facebook'
      });
      appConfig = (
        await createConfig({
          name: 'APP ID',
          key: 'app-main-id',
          value: a._id
        })
      ).toObject();
      appConfig.app = a;
      results.push(appConfig);
    } else {
      let a = await getApp({
        _id: appConfig.value
      });
      if (!a) {
        a = await createApp({
          app_id: '12345',
          verify_token: 'abc',
          app_secret: '12345',
          server_url: 'https://',
          type: 'facebook'
        });
      }
      appConfig.app = a;
    }
    return res.json(results);
  } catch (error) {
    _log('get List Config error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleGetConfig(req, res, next) {
  const id = req.params.id;
  try {
    const result = await getConfig({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('get List Config error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleCreateConfig(req, res, next) {
  const data = req.body;
  try {
    const result = await createConfig(data);
    return res.json(result);
  } catch (error) {
    _log('create Config error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleUpdateConfig(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  try {
    const result = await updateConfig({ _id: id }, data);
    return res.json(result);
  } catch (error) {
    _log('update Config error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleUpdateManyConfig(req, res, next) {
  const { ids, data } = req.body;
  try {
    const result = await updateManyConfig(
      {
        _id: {
          $in: ids
        }
      },
      data
    );
    return res.json(result);
  } catch (error) {
    _log('get List Config error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleDeleteConfig(req, res, next) {
  const id = req.params.id;
  try {
    const result = await deleteConfig({ _id: id });
    return res.json(result);
  } catch (error) {
    _log('Delete List Config error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleDeleteManyConfig(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyConfig({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many Config error : ', error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleDeleteManyConfig(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyConfig({
      _id: {
        $in: ids
      }
    });
    return res.json(result);
  } catch (error) {
    _log('Delete many Config error : ', error);
    next(error);
  }
}

// Export module
module.exports = router;
