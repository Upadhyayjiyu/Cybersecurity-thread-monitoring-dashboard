const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String }, // For easier querying if user doesn't exist
  ipAddress: { type: String, required: true },
  country: { type: String },
  city: { type: String },
  device: { type: String },
  success: { type: Boolean, required: true },
}, { timestamps: true });

module.exports = mongoose.model('LoginLog', loginLogSchema);
