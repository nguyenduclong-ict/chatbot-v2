require('./utils/extras');
require('./utils/firebase');
require('./utils/queue');
// setup global variable
global.__dirroot = __dirname;
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { initRouter } = require('./utils/router');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
const router = initRouter(
  path.join(__dirname, 'routes'),
  path.join(__dirname, 'middlewares'),
  /^_/gm,
  []
);
app.use(router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  if (err) _log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  let isJson =
    req.headers['content-type'] && req.headers['content-type'].includes('json');

  if (/\/webhook$/.test(req._parsedUrl.pathname)) {
    _log('webhook error', err);
    res.end();
  }
  if (isJson) {
    // render the error page
    res.status(err.status || 500).send(err.data || err.message);
  } else {
    res.status(err.status || 500);
    res.render('error');
  }
});

const { connectDatabase } = require('./services/MongoService');
connectDatabase().then(() => {});

module.exports = app;
