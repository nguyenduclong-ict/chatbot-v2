var express = require('express');
var router = express.Router();
const importAll = require('../utils/importAll');
const path = require('path');

/**
 *
 * @param {string} routerPath path to router folder
 * @param {string} middlewarePath path to middleware folder
 * @param {RegExp} exceptFile except file
 * @param {[{path : RegExp, middlewares : [string]}]} globalMiddlewares golbal middleware
 */
function initRouter(
  routerPath,
  middlewarePath,
  exceptFile,
  globalMiddlewares = []
) {
  const routes = importAll(routerPath, exceptFile);
  const middlewares = importAll(path.join(middlewarePath, '../middleware'));
  routes.forEach(route => {
    route.path = `/${route.name}`;
    // get middleware
    const names = route.instance.middlewares || [];
    globalMiddlewares.forEach(item => {
      if (new RegExp(item.path).test(route.path)) {
        names.push(item.middlewares);
      }
    });

    const mds = middlewares
      .filter(md => names.includes(md.name))
      .map(e => e.instance);
    // use route
    router.use(route.path, ...mds, route.instance);
  });

  return router;
}

module.exports = { initRouter };
