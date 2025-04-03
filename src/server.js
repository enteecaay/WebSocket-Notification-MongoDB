require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./db/dbConnect"); // Import the database connection
const { setupWebSocket } = require("./service/notiService"); // Import WebSocket service
const { markNotificationsAsRead } = require("./service/notificationService"); // Import notification service

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Setup WebSocket server
setupWebSocket(server);

// API to mark notifications as read
app.put("/notifications/read/:userId", markNotificationsAsRead);

app.get("/", (req, res) => {
  res.send("WebSocket server is running!");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () =>
  console.log(`🚀 WebSocket Server running on ws://localhost:${PORT}`)
);
