const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/db");

const nodemailer = require("nodemailer");

const router = express.Router();

// In-memory OTP store (email -> {code, expires})
const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  otpStore.set(email, { 
    code: otp, 
    expires: Date.now() + 10 * 60 * 1000 // 10 mins
  });

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"SENTINEL Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your SENTINEL Access Code",
        text: `Your one-time access code for the War Room is: ${otp}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #0a0a0a; color: white; border-radius: 10px;">
            <h2 style="color: #00c8ff;">SENTINEL Security</h2>
            <p>A login attempt was made for your account.</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; background: #111; text-align: center; border: 1px solid #333; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #888;">This code will expire in 10 minutes.</p>
          </div>
        `,
      });
      res.json({ message: "OTP sent successfully" });
    } else {
      console.log(`[DEMO MODE] OTP for ${email} is: ${otp}`);
      res.json({ message: "OTP sent successfully (Demo Mode - Check Server Console)", demo: true });
    }
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, code } = req.body;
  const stored = otpStore.get(email);

  if (!stored || stored.expires < Date.now()) {
    return res.status(400).json({ error: "OTP expired or not found" });
  }

  if (stored.code !== code) {
    return res.status(400).json({ error: "Invalid OTP code" });
  }

  // Clear OTP
  otpStore.delete(email);

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        password: "otp-login-" + Math.random(),
        role: "GUEST",
      },
    });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  res.json({ user, token });
});

// Register
router.post("/register", async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || "GUEST",
      },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    res.status(400).json({ error: "User already exists or invalid data" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
