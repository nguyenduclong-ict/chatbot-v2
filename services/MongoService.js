const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

/**
 * @param {mongoose.Schema} schema
 * @param {string} schemaName
 *
 */

function defindHook(schema, schemaName = '') {
  schema.pre('updateOne', function(next) {
    _log(
      `{${schemaName}} pre updateOne`,
      '\n--conditions: \n',
      this.getQuery(),
      '\n--data: \n',
      this.getUpdate()
    );
    next();
  });
  schema.pre('updateMany', function(next) {
    _log(
      `{${schemaName}} pre updateMany`,
      '\n--conditions: \n',
      this.getQuery(),
      '\n--data: \n',
      this.getUpdate()
    );
    next();
  });
  schema.pre('save', function(next) {
    _log(`{${schemaName}} pre save: \n`, this.toObject());
    next();
  });
}

async function connectDatabase(params) {
  // make db connect
  const { host, user, pass, dbName, port } = require('../config').mongodb;
  let uri = `mongodb://${host}:${port}/${dbName}`;
  let options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user,
    pass
  };
  options = params || options;
  // Connect mongoose

  return new Promise((resolve, reject) => {
    mongoose.connect(uri, options, (err, succ) => {
      if (!err) {
        console.log('database connect success');
        resolve(true);
      } else {
        console.log('Connect database failure', '\n', err);
        reject();
      }
    });
  });
}

module.exports = { mongoose, connectDatabase, defindHook };
