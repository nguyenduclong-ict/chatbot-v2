const config = require("../config");
const { host, user, pass, dbName, port } = config.mongodb;
const { createUserRole } = require("../providers/UserRoleProvider");
const mongoose = require("mongoose");
const Config = require("../models/Config");
const UserProvider = require("../providers/UserProvider");

// bcrypt
const bcrypt = require("bcrypt");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

function connectDatabase() {
  let uri = `mongodb://${host}:${port}/${dbName}`;

  options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    user,
    pass,
  };

  mongoose.connect(uri, options).then(async (rs) => {
    console.log("connect success to database: ", dbName);
    const isInitedDb = await Config.findOne({
      key: "initedDb",
      value: true,
    });

    if (!isInitedDb) {
      initDatabase();
    }
  });
}

async function initDatabase() {
  console.log("Begin init database");

  await Promise.all([
    createUserRole({ name: "Admin", value: "admin", level: 0 }),
    createUserRole({ name: "Manager", value: "manager" }),
  ]);

  // create admin user
  const password = bcrypt.hashSync("admin@1235", salt);
  await UserProvider.addUser({
    username: "admin",
    password,
    roles: ["admin"],
    isBlock: false,
  });

  await Config.update(
    {
      key: "initedDb",
    },
    {
      key: "initedDb",
      value: true,
    },
    { upsert: true }
  );
  console.log("Init database success");
}

module.exports = {
  connectDatabase,
};
