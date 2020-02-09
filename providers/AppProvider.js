const App = require('../models/App');
const { declareCRUD } = require('express-extra-tool').mongoose;
module.exports = {
  ...declareCRUD(App, 'App')
};
