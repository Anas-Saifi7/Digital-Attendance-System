// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, password, role, rollNumber, rollNo, department, phone, address } = req.body;
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const normalizedRoll = rollNumber || rollNo || "";
    const user = new User({
      fullName,
      email,
      password: hash,
      role,
      rollNumber: role === "Student" ? normalizedRoll : "",
      department: department || "",
      phone: phone || "",
      address: address || "",
    });
    await user.save();
    res.json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// export const login = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

//     // Find by email + role both
//     const user = await User.findOne({ email, role });

//     if (!user) return res.status(400).json({ error: "Invalid email or role" });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(400).json({ error: "Invalid password" });

//   const token = jwt.sign(
//   { id: user._id.toString(), role: user.role },   // ensure string
//   process.env.JWT_SECRET || "SECRET123",
//   { expiresIn: "7d" }
// );


//     res.json({
//       token,
//       role: user.role,
//       fullName: user.fullName,
//       rollNumber: user.rollNumber,
//       userId: user._id.toString()
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


export const login = async (req, res) => {
  try {
    const { email, password, role, rollNumber } = req.body;

    // Role must be selected
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // For STUDENT → Roll number mandatory
    if (role === "Student") {
      if (!rollNumber || rollNumber.trim() === "") {
        return res.status(400).json({ error: "Roll Number is required for students" });
      }
    }

    // Build query
    let query = { email, role };

    if (role === "Student") {
      query.rollNumber = rollNumber;  // Roll number must match
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials (email/role/roll number)" });
    }

    // Password check
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || "SECRET123",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      fullName: user.fullName,
      rollNumber: user.rollNumber,
      userId: user._id.toString()
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
