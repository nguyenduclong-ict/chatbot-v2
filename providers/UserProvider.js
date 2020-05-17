const User = require("../models/User");
const { declareCRUD } = require("express-extra-tool").mongoose;
const { getManyUserRole } = require("./UserRoleProvider");
/**
 *
 * @param {{email, password, info, role, username }} param0
 */

async function addUser({
  email,
  password,
  name,
  facebook_accounts,
  address,
  phone,
  roles,
  username,
  isBlock,
}) {
  try {
    // check user roles
    const userRoleData = await getManyUserRole({
      value: {
        $in: roles,
      },
    });
    const docs = userRoleData.data;
    if (docs.length < roles.length) throw new Error("Roles not exits");
    if (isBlock !== undefined) {
      if (docs.some((e) => e.level === 0 || e.value === "manager")) {
        isBlock = true;
      }
    }
    const data = {
      username,
      password,
      name,
      address,
      phone,
      facebook_accounts,
      is_block: isBlock,
      roles: docs.map((r) => r._id),
    };
    if (email) data.email = email;
    let user = new User(data);
    // add user info
    return user.save();
  } catch (error) {
    _log("add user error", error);
  }
}

/**
 * Get User Info
 * @param {*} param0
 */

async function getUser(query) {
  query = _omit(query, [null, undefined]);
  if (query === {}) return null;
  let user = await User.findOne(query).populate("roles").lean();
  return user;
}

/**
 * Update user
 * @param {*} _id user id
 * @param {*} param1
 */
async function updateUser(_id, data) {
  let user = await User.findById(_id);
  if (!user) return false;
  data = _omit(data, [null, undefined]);
  const facebook_accounts = data.facebook_accounts || [];
  user["facebook_accounts"] = user["facebook_accounts"] || [];
  facebook_accounts.forEach((e) => {
    let index = user["facebook_accounts"].findIndex((f) => f.id === e.id);
    _log(index);
    if (index >= 0) {
      user["facebook_accounts"][index] = e;
    } else {
      user["facebook_accounts"].push(e);
    }
  });
  Object.keys(data).forEach((key) => {
    if (key !== "facebook_accounts") {
      user[key] = data[key];
    }
  });
  // Update User Info
  return User.updateOne({ _id: user._id }, user.toObject());
}

module.exports = {
  ...declareCRUD(User, "User"),
  addUser,
  updateUser,
  getUser,
};
