require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./db/dbConnect"); // Import the database connection
const { setupWebSocket } = require("./service/notiService"); // Import WebSocket service

const app = express();
app.use(cors());

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Setup WebSocket server
setupWebSocket(server);

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
