const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  is_client: {
    type: Boolean,
  },
  otpcode: {
    type: Number,
  },
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

module.exports = User;
