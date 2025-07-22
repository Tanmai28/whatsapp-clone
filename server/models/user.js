const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' },
  status: { type: String, default: 'Hey there! I am using WhatsApp Clone.' },
  contacts: [{ type: String }] // Array of usernames
});

module.exports = mongoose.model('User', UserSchema);