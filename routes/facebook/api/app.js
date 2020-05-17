const express = require("express");
const router = express.Router();
// import model
const {
  createApp,
  updateApp,
  updateManyApp,
  getManyApp,
  deleteApp,
  getApp,
} = _rq("providers/AppProvider");
const Config = require("../../../models/Config");
// Middleware
router.use(_md("get-user-info"), _md("admin-role"));

// route
router.get("/", handleGetListApp);
router.get("/:id", handleGetApp);

router.post("/", handleCreateApp);

router.put("/:id", handleUpdateApp);
router.put("/", handleUpdateManyApp);

router.delete("/:id", handleDeleteApp);
router.post("/", handleDeleteManyApp);

router.post("/set-default", handleSetDefaultApp);

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleSetDefaultApp(req, res, next) {
  const { appId } = req.body;
  const u = await Config.updateOne(
    {
      key: "app-main-id",
    },
    { key: "app-main-id", value: appId },
    { upsert: true }
  );
  console.log(u);
  res.json({ success: true });
}

/**
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleGetListApp(req, res, next) {
  let { query, options } = _validateQuery(req.query);
  _log(query, options);
  try {
    const result = await getManyApp(query, options);
    return res.json(result);
  } catch (error) {
    _log("get List App error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleGetApp(req, res, next) {
  const id = req.params.id;
  try {
    const result = await getApp({ _id: id });
    return res.json(result);
  } catch (error) {
    _log("get List App error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleCreateApp(req, res, next) {
  const data = req.body;
  try {
    const result = await createApp(data);
    return res.json(result);
  } catch (error) {
    _log("create App error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleUpdateApp(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  try {
    const result = await updateApp({ _id: id }, data);
    return res.json(result);
  } catch (error) {
    _log("update App error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleUpdateManyApp(req, res, next) {
  const { ids, data } = req.body;
  try {
    const result = await updateManyApp(
      {
        _id: {
          $in: ids,
        },
      },
      data
    );
    return res.json(result);
  } catch (error) {
    _log("get List App error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleDeleteApp(req, res, next) {
  const id = req.params.id;
  try {
    const result = await deleteApp({ _id: id });
    return res.json(result);
  } catch (error) {
    _log("Delete List App error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleDeleteManyApp(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyApp({
      _id: {
        $in: ids,
      },
    });
    return res.json(result);
  } catch (error) {
    _log("Delete many App error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleDeleteManyApp(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyApp({
      _id: {
        $in: ids,
      },
    });
    return res.json(result);
  } catch (error) {
    _log("Delete many App error : ", error);
    next(error);
  }
}

// Export module
module.exports = router;
