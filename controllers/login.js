require("dotenv").config();
const { generateToken } = require("../utils/jwt");

// User login: accepts email only
function userLogin(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const token = generateToken({ email, role: "user" });
  res.json({ token });
}

// Admin login: email + password
function adminLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  const token = generateToken({ email, role: "admin" });
  res.json({ token });
}

module.exports = { userLogin, adminLogin };
