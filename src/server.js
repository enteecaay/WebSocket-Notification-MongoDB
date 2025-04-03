require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const connectDB = require("./db/dbConnect"); // Import the database connection
const Notification = require("./models/Notification");

const app = express();
app.use(cors());

// Connect to MongoDB
connectDB();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map();

// WebSocket connection logic
wss.on("connection", (ws, req) => {
  const urlParams = new URLSearchParams(req.url.split("?")[1]); // Parse query params
  const userId = urlParams.get("userId"); // Get userId from query params

  if (!userId) {
    console.error("❌ Connection rejected: userId is missing");
    return;
  }

  clients.set(userId, ws);
  console.log(`🔌 User ${userId} connected`);

  // Send all unread notifications from MongoDB
  Notification.find({ userId, status: "unread" }).then((notifications) => {
    notifications.forEach((notification) => {
      ws.send(JSON.stringify(notification));
    });
  });

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log("📩 New notification:", data);

      // Save to MongoDB
      const newNotification = new Notification({
        userId: data.userId,
        message: data.message,
      });
      await newNotification.save();

      // Send real-time notification to the corresponding client
      const recipientSocket = clients.get(data.userId);
      if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
        recipientSocket.send(JSON.stringify(newNotification));
      }
    } catch (error) {
      console.error("❌ Error handling message:", error.message);
    }
  });

  ws.on("close", () => {
    console.log(`❌ User ${userId} disconnected`);
    clients.delete(userId);
  });
});

// API to mark notifications as read
app.put("/notifications/read/:userId", async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, status: "unread" },
      { status: "read" }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("WebSocket server is running!");
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () =>
  console.log(`🚀 WebSocket Server running on ws://localhost:${PORT}`)
);
