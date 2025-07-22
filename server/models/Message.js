const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },      // Username of sender
  receiver: { type: String, required: true },    // Username of receiver
  content: { type: String, required: true },     // Message text
  timestamp: { type: Date, default: Date.now },  // When message was sent
  isRead: { type: Boolean, default: false },     // Message read status
  type: { type: String, enum: ['text', 'image', 'file'], default: 'text' }, // Message type
  fileUrl: { type: String },                     // URL for file/image messages
  metadata: {                                    // Additional message metadata
    fileName: String,
    fileSize: Number,
    mimeType: String
  }
});

module.exports = mongoose.model('Message', MessageSchema);