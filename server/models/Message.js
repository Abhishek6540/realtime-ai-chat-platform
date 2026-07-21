import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: String,
  avatar: String,
  content: {
    type: String,
    required: true,
  },
  suggestedReply: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.index({ createdAt: -1 });

export default mongoose.model('Message', messageSchema);
