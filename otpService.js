import nodemailer from "nodemailer";
import crypto from "crypto";

/* =======================
   GMAIL TRANSPORTER
======================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =======================
   OTP STORE (TEMP)
======================= */
const otpStore = new Map();

/* =======================
   GENERATE OTP
======================= */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/* =======================
   SEND OTP EMAIL
======================= */
export const sendOTPEmail = async (email, otp) => {
  const normalizedEmail = email.toLowerCase();

  try {
    console.log(`📡 Sending OTP via Gmail to ${normalizedEmail}`);

    await transporter.sendMail({
      from: `"Replateo" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Your Replateo Verification Code",
      html: `
        <h2 style="color:#f97316;">Replateo Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:5px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });

    otpStore.set(normalizedEmail, {
      otp: otp.toString(),
      expires: Date.now() + 10 * 60 * 1000,
    });

    console.log("✅ OTP sent successfully via Gmail");

  } catch (error) {
    console.error("❌ Gmail OTP Error:", error);
    throw new Error("OTP_EMAIL_FAILED");
  }
};

/* =======================
   VERIFY OTP
======================= */
export const verifyOTP = (email, otp) => {
  const normalizedEmail = email.toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record) return false;

  if (Date.now() > record.expires) {
    otpStore.delete(normalizedEmail);
    return false;
  }

  if (record.otp === otp.toString()) {
    otpStore.delete(normalizedEmail);
    return true;
  }

  return false;
};

/* =======================
   RESET OTP EMAIL
======================= */
export const sendResetOTPEmail = sendOTPEmail;