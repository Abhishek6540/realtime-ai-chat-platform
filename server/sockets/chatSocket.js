import Message from "../models/Message.js";
import User from "../models/User.js";
import { verifyToken, getUserById } from "../services/AuthService.js";
import { generateSuggestedReply } from "../services/GeminiService.js";
import { io } from "../config/socket.js";

export default async function chatSocket(socket) {

  socket.on('authenticate', async (token) => {
    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        socket.emit('auth-error', 'Invalid token');
        return;
      }

      socket.userId = decoded.userId;
      const user = await getUserById(socket.userId);

      socket.emit('authenticated', {
        userId: socket.userId,
        userName: user.name,
        userAvatar: user.avatar,
      });

      socket.join('chat-room');
      console.log('User authenticated:', socket.userId);
    } catch (error) {
      console.error('Socket auth error:', error.message);
      socket.emit('auth-error', 'Authentication failed');
    }
  });

  socket.on('send-message', async (data) => {
    try {
      if (!socket.userId) {
        socket.emit('error', 'Not authenticated');
        return;
      }

      const user = await getUserById(socket.userId);

      const message = new Message({
        userId: socket.userId,
        userName: user.name,
        userAvatar: user.avatar,
        content: data.content,
      });

      await message.save();

      if (user.isPremium) {
        const suggestedReply = await generateSuggestedReply(data.content);
        message.suggestedReply = suggestedReply;
        await message.save();
      }

      io.to('chat-room').emit('new-message', {
        id: message._id,
        userId: message.userId,
        userName: message.userName,
        userAvatar: message.userAvatar,
        content: message.content,
        suggestedReply: message.suggestedReply,
        createdAt: message.createdAt,
      });

      console.log('Message sent:', message._id);
    } catch (error) {
      console.error('Send message error:', error.message);
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on('load-messages', async () => {
    try {
      const messages = await Message.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .exec();

      const formattedMessages = messages.reverse().map((msg) => ({
        id: msg._id,
        userId: msg.userId,
        userName: msg.userName,
        userAvatar: msg.userAvatar,
        content: msg.content,
        suggestedReply: msg.suggestedReply,
        createdAt: msg.createdAt,
      }));

      socket.emit('messages-loaded', formattedMessages);
      console.log('Messages loaded:', formattedMessages.length);
    } catch (error) {
      console.error('Load messages error:', error.message);
      socket.emit('error', 'Failed to load messages');
    }
  });

  socket.on('payment-success', async () => {
    try {
      if (!socket.userId) return;

      const user = await User.findById(socket.userId);
      io.to('chat-room').emit('user-became-premium', {
        userId: user._id,
        userName: user.name,
      });

      console.log('User became premium:', socket.userId);
    } catch (error) {
      console.error('Payment success event error:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

}