// models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'jobcollections',
    required: true,
  },
  seekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seeker', // assuming you have a User model for seekers and providers
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'provider',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Conversation', conversationSchema);
