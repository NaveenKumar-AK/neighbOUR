const mongoose = require('mongoose');

const jobRequestSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  status: { type: String, enum: ['open', 'accepted', 'completed'], default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('JobRequest', jobRequestSchema);
