import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  roll: Number,
  branch: String,
  subject: String,
  status: { type: String, default: "Present" },
});

export default mongoose.model("Student", studentSchema);
