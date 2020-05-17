// get config to env
require("dotenv").config();
const config = require("./config");

const lodash = require("lodash");
const extraTool = require("express-extra-tool");
extraTool.initGlobal({
  dirroot: __dirname,
  additions: [{ name: "_", value: lodash }],
});
Object.assign(process.env, config.env);
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
var app = express();

// Services
const Queue = require("./services/Queue");
const kue = require("kue");
Queue.removeAllListeners();
Queue.active(function (err, ids) {
  ids.forEach(function (id) {
    kue.Job.get(id, function (err, job) {
      // Your application should check if job is a stuck one
      job.remove();
    });
  });
});

// Cronjob
const Cron = require("./services/Cron");
const cronjobs = ["broadcast-job", "crawl-customer-job"];
Cron.filter((e) => cronjobs.includes(e.name)).forEach((item) => {
  _log("Start cronjob " + item.name);
  item.job.start();
});

// database
require("./services/Mongoose").connectDatabase();

// JWT Token
extraTool.jwt.initJWT({
  secret: config.jwt.JWT_SECRET,
  tokenExpires: config.jwt.TOKEN_EXPIRES,
});
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ extended: true, limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// init router
const router = extraTool.initRouter();
console.log(router);
app.use(router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
app.use(handleError);

/**
 * Recived Event
 * @param {Error} err
 * @param {express.request} req
 * @param {express.response} res
 * @param {NextFunction} next
 */
function handleError(err, req, res, next) {
  // set locals, only providing error in development
  _log(err);
  if (err) {
    _log(err);
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    let isJson =
      req.headers["content-type"] &&
      req.headers["content-type"].includes("json");

    if (/\/webhook$/.test(req._parsedUrl.pathname)) {
      _log("webhook error", err);
      res.destroy();
    }
    if (isJson) {
      // render the error page
      res.status(err.status || 500).send(err.data || err.message);
    } else if (err.isJson) {
      res.status(err.status || 500).send(err.data || err.message);
    } else {
      res.status(err.status || 500);
      res.render("error");
    }
  }
}

module.exports = app;
