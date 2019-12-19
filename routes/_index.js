var express = require("express");
var router = express.Router();
const importAll = require("../utils/requireAll");
const path = require("path");
// import all route in routes folder
const routes = importAll(__dirname, /^_/gm);

routes.forEach(route => {
  route.path = `/${route.name}`;
  const middleware = route.instance.middleware || [];
  middlewares = importAll(path.join(__dirname, "../middleware"))
    .filter(md => middleware.includes(md.name))
    .map(e => e.instance);
  // use route
  router.use(route.path, ...middlewares, route.instance);
});

module.exports = router;
