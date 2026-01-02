import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(" ")[1];

    // ✅ DECODE TOKEN (THIS WAS MISSING / MISPLACED)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 NORMALIZE ROLE (VERY IMPORTANT)
    req.user = {
      id: decoded.id,
      role: decoded.role?.toLowerCase()
    };

    // console.log("AUTH USER:", req.user);

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;
