import http from "http";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { initSocket } from "./config/socket.js";
 
dotenv.config();

class AppServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.server = http.createServer(this.app);
  }

  configureMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  configureRoutes() {
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/payments", paymentRoutes);
  }

  initializeSocket() {
    initSocket(this.server);
  }

  async initializeDatabase() {
    await connectDB();
  }

  async start() {
    this.configureMiddleware();
    this.configureRoutes();
    this.initializeSocket();
    await this.initializeDatabase();

    this.server.listen(this.port, () => {
      console.log(`Server running on ${this.port}`);
    });
  }
}

const appServer = new AppServer();

appServer.start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});