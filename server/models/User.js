const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'provider', 'admin'], required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  address: { type: String },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  // Provider Specific Fields
  profilePhoto: { type: String }, // Base64 or URL
  bio: { type: String, maxlength: 150 },
  workingDays: [{ type: String }],
  workingHours: {
    start: { type: String },
    end: { type: String }
  },
  skills: [{ type: String }],
  availability: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  jobsCompleted: { type: Number, default: 0 },
  yearsOfExperience: { type: Number },
  workTiming: { type: String },
  proofOfIdentity: { type: String } // Base64 or URL
}, { timestamps: true });

// Create a 2dsphere index for geospatial queries
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
