const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: "All fields are required (fullName, email, password).",
      });
    }

    // Check email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long.",
      });
    }

    // Check duplicate email
    const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "An account with this email already exists.",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user and return ID
    const insertRes = await db.query(
      "INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [fullName, email, hashedPassword]
    );
    const newUserId = insertRes.rows[0].id;



    return res.status(201).json({
      id: newUserId,
      fullName,
      email,
    });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    // Find user by email
    const userRes = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = userRes.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userRes = await db.query(
      "SELECT id, full_name, email FROM users WHERE id = $1",
      [req.user.id]
    );
    const user = userRes.rows[0];

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    return res.status(200).json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
    });
  } catch (err) {
    console.error("Get user error:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
