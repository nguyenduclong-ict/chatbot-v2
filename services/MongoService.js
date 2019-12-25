const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

/**
 * @param {mongoose.Model} model
 * @param {string} name
 *
 */

function declareCRUD(model, name) {
  const result = {
    /**
     * Get one document
     */
    ['get' + name]: function(conditions) {
      return model.findOne(conditions);
    },
    /**
     * Get Many
     */
    ['getMany' + name]: async function(query, { page, limit }) {
      query = _omit(query);
      page = page || 0;
      limit = limit || 10;

      const [list, count] = await Promise.all([
        model
          .find(query)
          .skip(limit * page)
          .limit(page)
          .lean(),
        model.count(query)
      ]);
      // pager
      const pager = {
        page: page,
        total: count,
        page_size: limit,
        total_page: Math.floor(count / limit + 1)
      };
      return { data: list || [], pager };
    },
    ['create' + name]: function(docs) {
      return model.create(docs);
    },
    ['createMany' + name]: function(docs) {
      return model.insertMany(docs);
    },
    ['update' + name]: function(conditions, data, upsert = false) {
      return model.findOneAndUpdate(conditions, data, {
        new: true,
        setDefaultsOnInsert: true,
        upsert
      });
    },
    ['updateMany' + name]: function(conditions, data, create = false) {
      return model.updateMany(conditions, data, {
        upsert: true,
        setDefaultsOnInsert: true,
        new: true
      });
    },
    ['delete' + name]: function(conditions) {
      return model.deleteOne(conditions);
    },
    ['deleteMany' + name]: function(conditions) {
      return model.deleteMany(conditions);
    }
  };

  return result;
}

/**
 * @param {mongoose.Schema} schema
 * @param {string} schemaName
 *
 */

function declareHook(schema, schemaName = '') {
  if (process.env.NODE_ENV === 'production') return;
  // pre updateOne
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
  // pre updateMany
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
  // pre save
  schema.pre('save', function(next) {
    _log(`{${schemaName}} pre save: \n`, this.toObject());
    if (schemaName === 'Tag') {
    }
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

module.exports = { mongoose, connectDatabase, declareHook, declareCRUD };
