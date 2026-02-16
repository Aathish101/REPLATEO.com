import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { analyzeFoodImage } from "./foodAnalyzer.js";
import { logAnalysis } from "./csvStorage.js";
import { sendOTPEmail, verifyOTP, sendResetOTPEmail } from "./otpService.js";
import { readFile } from "fs/promises";
import admin from "firebase-admin";



dotenv.config();

console.log(`🚀 Starting Backend...`);
console.log(`📧 Configured Email: ${process.env.EMAIL_USER ? process.env.EMAIL_USER.replace(/(.{3}).*(@.*)/, "$1***$2") : "NOT SET"}`);

const app = express();
const PORT = Number(process.env.PORT) || 5000;

/* =========================
   🔧 MIDDLEWARE
========================= */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://replateo.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   📦 MULTER
========================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/* =========================
   📧 EMAIL CONFIG (DEPRECATED - MOVED TO otpService.js)
   ========================= */
// Redundant configuration removed. Logic now handled by otpService.js

/* =========================
   🔥 FIREBASE ADMIN INIT
   ========================= */
const serviceAccountPath = "./serviceAccountKey.json";

try {
  const serviceAccount = JSON.parse(
    await readFile(new URL(serviceAccountPath, import.meta.url))
  );

 if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

  console.log("✅ Firebase Admin Initialized");
} catch (error) {
  console.warn("⚠️ Firebase Admin NOT initialized. Password reset will fail until serviceAccountKey.json is added.");
  console.warn("Error:", error.message);
}

app.get("/", (req, res) => {
  res.send("🚀 REPLATEO Backend is running successfully!");
});

/* =========================
   ✅ HEALTH
========================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy" });
});

/* =========================
   📧 SEND OTP
   ========================= */
app.post("/api/send-otp", async (req, res) => {
  let { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await sendOTPEmail(email, otp);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ Email error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* =========================
   📧 SEND RESET OTP
   ========================= */
app.post("/api/send-reset-otp", async (req, res) => {
  let { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await sendResetOTPEmail(email, otp);
    res.json({ success: true, message: "Reset OTP sent successfully" });
  } catch (err) {
    console.error("❌ Reset Email error:", err);
    res.status(500).json({ message: "Failed to send reset OTP" });
  }
});

/* =========================
   🔑 VERIFY OTP
   ========================= */
app.post("/api/verify-otp", (req, res) => {
  let { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email & OTP required" });
  }

  const isValid = verifyOTP(email, otp);

  if (isValid) {
    res.json({ success: true, message: "OTP verified successfully" });
  } else {
    res.status(400).json({ message: "Invalid or expired OTP" });
  }
});

/* =========================
   🔑 RESET PASSWORD (Placeholder)
   ========================= */
app.post("/api/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields required" });
  }

  const isValid = verifyOTP(email, otp);

  if (!isValid) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  try {
    // 1. Get User by Email
    const userRecord = await admin.auth().getUserByEmail(email);

    // 2. Update Password
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
    });

    console.log(`✅ Password updated for ${email}`);

    res.json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });

  } catch (error) {
    console.error("❌ Firebase Password Update Error:", error);

    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: "User not found in system." });
    }

    res.status(500).json({ message: "Failed to update password in system." });
  }
});

/* =========================
   🍱 ANALYZE FOOD
========================= */
app.post("/api/analyze-food", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image required" });
    }

    const { preparationTime, packageTime } = req.body;
    if (!preparationTime || !packageTime) {
      return res.status(400).json({ error: "Times required" });
    }

    const result = await analyzeFoodImage(
      req.file.buffer,
      preparationTime,
      packageTime,
      req.file.mimetype
    );

    await logAnalysis({
      imageFilename: req.file.originalname,
      preparationTime,
      packageTime,
      analysisResult: result,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   🚀 START
========================= */
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
