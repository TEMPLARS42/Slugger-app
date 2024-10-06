const mongoose = require('mongoose');
const bycrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
  userName: { type: String },
  // city: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, }
});

module.exports = mongoose.model('userInfo', userSchema);
