const WebSocket = require("ws");
const Notification = require("../models/Notification");

const clients = new Map();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split("?")[1]); // Parse query params
    const userId = urlParams.get("userId"); // Get userId from query params

    if (!userId) {
      console.error("❌ Connection rejected: userId is missing");
      ws.close(); // Close the connection if userId is missing
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
}

module.exports = { setupWebSocket };
