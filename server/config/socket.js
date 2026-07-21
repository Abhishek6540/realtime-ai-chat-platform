import { Server } from "socket.io";
import chatSocketController from "../sockets/chatSocket.js";

let io;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => chatSocketController.attach(socket));
};

export { io };