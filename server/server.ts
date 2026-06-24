import { app } from "./app.js";
import connectDB from "./utils/db.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
import { initSocketServer } from "./socketServer.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 8000;

const server = http.createServer(app);

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

initSocketServer(server);

connectDB();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;