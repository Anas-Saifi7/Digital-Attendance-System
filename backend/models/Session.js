// models/Session.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  classRoom: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  qrToken: { type: String, required: true },
  validUntil: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;
