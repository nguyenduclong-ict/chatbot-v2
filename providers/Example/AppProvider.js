const App = require('../../models/Example/App');
const { declareCRUD } = require('express-extra-tool').mongoose;
module.exports = {
  ...declareCRUD(App, 'App')
};
