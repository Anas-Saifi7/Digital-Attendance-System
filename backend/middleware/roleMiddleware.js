


const roleMiddleware = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userRole = req.user.role.toLowerCase();

    if (!roles.map(r => r.toLowerCase()).includes(userRole)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};

export default roleMiddleware;
