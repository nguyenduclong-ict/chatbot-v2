const config = require('../config');
const { host, user, pass, dbName, port } = config.mongodb;
const UserRole = require('../models/UserRole');
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
  UserRole.updateOne(
    { value: 'admin' },
    { name: 'Admin', value: 'admin' },
    {
      upsert: true,
      setDefaultsOnInsert: true,
      new: true
    }
  );
  UserRole.updateOne(
    { value: 'manager' },
    { name: 'Manager', value: 'manager' },
    {
      upsert: true,
      setDefaultsOnInsert: true,
      new: true
    }
  );
}

initUserRole();

module.exports = {
  connectDatabase
};
