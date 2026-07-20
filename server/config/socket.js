import { Server } from "socket.io";
import chatSocket from "../sockets/chatSocket.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
    },
  });

  io.on("connection", chatSocket);
};

export { io };