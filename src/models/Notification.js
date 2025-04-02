const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["unread", "read"], default: "unread" },
  createdAt: { type: Date, default: Date.now },
  claimId: { type: String, default: null },
  type: {
    type: String,
    enum: ["newClaim", "Approved", "Rejected", "Return", "Paid"],
    default: "newClaim",
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
