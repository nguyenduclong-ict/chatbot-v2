const mongoose = require("mongoose");

var Schema = mongoose.Schema;
var schema = new Schema({
  name: String,
  key: {
    type: String,
    unique: true,
  },
  value: {
    type: Schema.Types.Mixed,
    default: null,
  },
  created: { type: Date, default: Date.now() },
});

var Config = mongoose.model("Config", schema);

module.exports = Config;
