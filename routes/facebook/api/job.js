const express = require("express");
const router = express.Router();
// import model
const {
  createJob,
  updateJob,
  updateManyJob,
  getManyJob,
  deleteJob,
  getJob,
} = _rq("providers/JobProvider");
const { handleJob } = require("../../../services/Cron");
// Middleware
router.use(_md("get-user-info"));

// route
router.get("/", handleGetListJob);
router.get("/:id", handleGetJob);

router.post("/", handleCreateJob);

router.put("/:id", handleUpdateJob);
router.put("/", handleUpdateManyJob);

router.delete("/:id", handleDeleteJob);
router.post("/", handleDeleteManyJob);

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleGetListJob(req, res, next) {
  let { query, options } = _validateQuery(req.query);
  _log(query, options);
  try {
    query = _omit({
      ...query,
      user_id: req.user._id,
    });
    const result = await getManyJob(query, options);
    return res.json(result);
  } catch (error) {
    _log("get List Job error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleGetJob(req, res, next) {
  const id = req.params.id;
  try {
    const result = await getJob({ _id: id });
    return res.json(result);
  } catch (error) {
    _log("get List Job error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleCreateJob(req, res, next) {
  const data = req.body;
  data.user_id = req.user._id;
  try {
    if (!data.delay) {
      // Gửi ngay lập tức
      data.status = "doing";
    }
    const result = await createJob(data);

    if (!data.delay) {
      // Gửi ngay lập tức
      await handleJob(result);
    }

    return res.json(result);
  } catch (error) {
    _log("create Job error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleUpdateJob(req, res, next) {
  const id = req.params.id;
  const data = req.body;
  try {
    const result = await updateJob({ _id: id }, data);
    return res.json(result);
  } catch (error) {
    _log("update Job error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleUpdateManyJob(req, res, next) {
  const { ids, data } = req.body;
  try {
    const result = await updateManyJob(
      {
        _id: {
          $in: ids,
        },
      },
      data
    );
    return res.json(result);
  } catch (error) {
    _log("get List Job error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleDeleteJob(req, res, next) {
  const id = req.params.id;
  try {
    const result = await deleteJob({ _id: id });
    return res.json(result);
  } catch (error) {
    _log("Delete List Job error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleDeleteManyJob(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyJob({
      _id: {
        $in: ids,
      },
    });
    return res.json(result);
  } catch (error) {
    _log("Delete many Job error : ", error);
    next(error);
  }
}

/**
 
 * @param { express.request } req
 * @param { express.response } res
 * @param { express.next } next
 */

async function handleDeleteManyJob(req, res, next) {
  const { ids } = req.body;
  try {
    const result = await deleteManyJob({
      _id: {
        $in: ids,
      },
    });
    return res.json(result);
  } catch (error) {
    _log("Delete many Job error : ", error);
    next(error);
  }
}

// Export module
module.exports = router;
