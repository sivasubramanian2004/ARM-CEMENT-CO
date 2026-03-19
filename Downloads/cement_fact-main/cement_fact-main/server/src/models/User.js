const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    contactNo: { type: String, trim: true },
    place: { type: String, trim: true },
    address: { type: String, trim: true },
    state: { type: String, trim: true },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
