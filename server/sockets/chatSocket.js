import Message from "../models/Message.js";
import User from "../models/User.js";
import { verifyToken, getUserById } from "../services/AuthService.js";
import { generateSuggestedReply } from "../services/GeminiService.js";
import { io } from "../config/socket.js";

class ChatSocketController {
  attach(socket) {
    socket.on("authenticate", async (token) => {
      await this.handleAuthenticate(socket, token);
    });

    socket.on("send-message", async (data) => {
      await this.handleSendMessage(socket, data);
    });

    socket.on("load-messages", async () => {
      await this.handleLoadMessages(socket);
    });

    socket.on("payment-success", async () => {
      await this.handlePaymentSuccess(socket);
    });

    socket.on("disconnect", () => {
      this.handleDisconnect(socket);
    });
  }

  async handleAuthenticate(socket, token) {
    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        socket.emit("auth-error", "Invalid token");
        return;
      }

      socket.userId = decoded.userId;
      const user = await getUserById(socket.userId);

      socket.emit("authenticated", {
        id: socket.userId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isPremium: user.isPremium,
      });

      socket.join("chat-room");
      console.log("User authenticated:", socket.userId);
    } catch (error) {
      console.error("Socket auth error:", error.message);
      socket.emit("auth-error", "Authentication failed");
    }
  }

  async handleSendMessage(socket, data) {
    try {
      if (!socket.userId) {
        socket.emit("error", "Not authenticated");
        return;
      }

      const user = await getUserById(socket.userId);

      const message = new Message({
        userId: socket.userId,
        name: user.name,
        avatar: user.avatar,
        content: data.content,
      });

      await message.save();

      const suggestedReply = await generateSuggestedReply(data.content);
      message.suggestedReply = suggestedReply;
      await message.save();

      io.to("chat-room").emit("new-message", {
        id: message._id,
        userId: message.userId,
        name: message.name,
        avatar: message.avatar,
        content: message.content,
        suggestedReply: message.suggestedReply,
        createdAt: message.createdAt,
      });

      console.log("Message sent:", message._id);
    } catch (error) {
      console.error("Send message error:", error.message);
      socket.emit("error", "Failed to send message");
    }
  }

  async handleLoadMessages(socket) {
    try {
      const messages = await Message.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .exec();

      const formattedMessages = messages.reverse().map((msg) => ({
        id: msg._id,
        userId: msg.userId,
        name: msg.name,
        avatar: msg.avatar,
        content: msg.content,
        suggestedReply: msg.suggestedReply,
        createdAt: msg.createdAt,
      }));

      socket.emit("messages-loaded", formattedMessages);
      console.log("Messages loaded:", formattedMessages.length);
    } catch (error) {
      console.error("Load messages error:", error.message);
      socket.emit("error", "Failed to load messages");
    }
  }

  async handlePaymentSuccess(socket) {
    try {
      if (!socket.userId) return;

      const user = await User.findById(socket.userId);
      if (!user) return;

      user.isPremium = true;
      await user.save();

      socket.emit("premium-updated", { isPremium: true });
      io.to("chat-room").emit("user-became-premium", {
        userId: user._id.toString(),
        name: user.name,
        avatar: user.avatar,
        isPremium: true,
      });

      console.log("User became premium:", socket.userId);
    } catch (error) {
      console.error("Payment success event error:", error.message);
    }
  }

  handleDisconnect(socket) {
    console.log("User disconnected:", socket.id);
  }
}

const chatSocketController = new ChatSocketController();

export default chatSocketController;