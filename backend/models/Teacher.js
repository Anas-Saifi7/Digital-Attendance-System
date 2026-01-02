import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  email: String,
  address: String,
  gender: String,
  subject: String,
  qualification: String,
  experience: String,
  joiningDate: String
}, { timestamps: true });

export default mongoose.model("Teacher", teacherSchema);
