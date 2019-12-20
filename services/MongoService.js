const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

async function connectDatabase(params) {
  // make db connect
  const { host, user, pass, dbName, port } = require('../config').mongodb;
  let uri = `mongodb://${host}:${port}/${dbName}`;
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user,
    pass
  };

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

module.exports = { mongoose, connectDatabase };
