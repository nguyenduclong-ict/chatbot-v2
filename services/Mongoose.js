const config = require('../config');
const { host, user, pass, dbName, port } = config.mongodb;
const { createUserRole } = require('../providers/UserRoleProvider');
const mongoose = require('mongoose');

function connectDatabase() {
  let uri = `mongodb://${host}:${port}/${dbName}`;

  options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    user,
    pass
  };

  mongoose.connect(uri, options).then(rs => {
    console.log('connect success to database: ', dbName);
  });
}

function initUserRole() {
  createUserRole({ name: 'Admin', value: 'admin' });
  createUserRole({ name: 'Manager', value: 'manager' });
}
module.exports = {
  connectDatabase
};
