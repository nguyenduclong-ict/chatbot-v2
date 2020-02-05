const { declareCRUD } = require('express-extra-tool').mongoose;
const UserRole = require('../models/UserRole');

module.exports = {
  ...declareCRUD(UserRole, 'UserRole')
};
