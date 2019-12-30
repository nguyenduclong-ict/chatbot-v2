const Flow = require('../models/Flow');
const { declareCRUD } = require('express-extra-tool').mongoose;
module.exports = {
  ...declareCRUD(Flow, 'Flow')
};
