const Config = require('../models/Config');
const { declareCRUD } = require('express-extra-tool').mongoose;
module.exports = {
  ...declareCRUD(Config, 'Config')
};
