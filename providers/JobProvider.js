const Job = require('../models/Job');
const { declareCRUD, declareHook } = require('express-extra-tool').mongoose;

module.exports = {
  ...declareCRUD(Job, 'Job')
};
