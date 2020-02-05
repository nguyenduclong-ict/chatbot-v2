const Block = require('../models/Block');
const { declareCRUD } = require('express-extra-tool').mongoose;
module.exports = {
  ...declareCRUD(Block, 'Block')
};
