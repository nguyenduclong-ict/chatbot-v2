const Job = require('../models/Job');
const { declareCRUD } = require('express-extra-tool').mongoose;
module.exports = {
  ...declareCRUD(Job, 'Job')
};
