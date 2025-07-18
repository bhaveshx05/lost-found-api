require("dotenv").config();
const { verifyToken } = require("../utils/jwt");

function isUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "user" && decoded.role !== "admin") {
      return res.status(403).json({ error: "User access required" });
    }
    req.user = decoded; // { email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { isUser };
