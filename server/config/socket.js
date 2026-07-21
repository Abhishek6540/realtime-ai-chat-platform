import { Server } from "socket.io";
import chatSocketController from "../sockets/chatSocket.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => chatSocketController.attach(socket));
};

export { io };