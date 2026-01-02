
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Student", "Faculty", "Admin"], default: "Student" },
  rollNumber: { type: String, default: "" },
  department: { type: String, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
export default User;
