const TestPage = require('../../models/Example/TestPage');
const { declareCRUD } = require('express-extra-tool').mongoose;
module.exports = {
  ...declareCRUD(TestPage, 'TestPage')
};
