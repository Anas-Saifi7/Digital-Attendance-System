// models/Notification.js
import mongoose from "mongoose";

const notifSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: { type: String, default: "info" },
  unread: { type: Boolean, default: true },
  time: { type: String, default: () => new Date().toLocaleString() },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notifSchema);
export default Notification;
