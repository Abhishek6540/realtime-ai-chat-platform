import http from "http";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { initSocket } from "./config/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();


app.use(cors());
app.use(express.json());

connectDB();

const server = http.createServer(app);

initSocket(server);

app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);


server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});