module.exports.createError = function(message, code) {
  const err = new Error(message);
  err.code = code;
  err.status = code;
  return err;
};
