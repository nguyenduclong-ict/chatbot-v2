const Tag = require('../models/Tag');
const { declareCRUD } = require('express-extra-tool').mongoose;
module.exports = {
  ...declareCRUD(Tag, 'Tag')
};
