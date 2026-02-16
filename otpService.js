import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

/* =======================
   EMAIL TRANSPORT CONFIG
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
// NOTE: For production, use Redis / DB
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

  console.log(`DEBUG: Sending email. User: ${process.env.EMAIL_USER}, PassLength: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0}`);

  const mailOptions = {
    from: process.env.EMAIL_USER, // Simplified for debugging
    to: normalizedEmail,
    subject: "Your Replateo Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #f97316; text-align: center;">Replateo Verification</h2>
        <p>Hello,</p>
        <p>Use the OTP below to verify your email:</p>
        <div style="background-color: #fff7ed; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #f97316; letter-spacing: 6px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you didn’t request this, ignore this email.</p>
        <hr />
        <p style="font-size: 12px; color: #888; text-align: center;">
          © 2026 Replateo. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    console.log(`📡 Attempting to send OTP to ${normalizedEmail}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent info:", info.response);

    otpStore.set(normalizedEmail, {
      otp: otp.toString(),
      expires: Date.now() + 10 * 60 * 1000,
    });

    console.log(`📨 OTP sent successfully to ${normalizedEmail} from ${process.env.EMAIL_USER}`);
    return true;
  } catch (error) {
    console.error(`❌ Email sending failed:`, error);
    throw new Error(`OTP_EMAIL_FAILED: ${error.message}`);
  }
};

/* =======================
   VERIFY OTP
======================= */
export const verifyOTP = (email, otp) => {
  const normalizedEmail = email.toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    console.log("❌ No OTP record found");
    return false;
  }

  if (Date.now() > record.expires) {
    console.log("❌ OTP expired");
    otpStore.delete(normalizedEmail);
    return false;
  }

  if (record.otp === otp.toString()) {
    console.log("✅ OTP verified");
    otpStore.delete(normalizedEmail);
    return true;
  }

  console.log("❌ OTP mismatch");
  return false;
};

/* =======================
   SEND RESET OTP EMAIL
======================= */
export const sendResetOTPEmail = async (email, otp) => {
  const normalizedEmail = email.toLowerCase();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: normalizedEmail,
    subject: "Reset your Replateo password",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 16px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #ea580c; margin: 0; font-size: 28px;">Password Reset</h2>
          <p style="color: #666; font-size: 16px;">Securely update your account access</p>
        </div>
        
        <p>We received a request to reset your Replateo password. Use the verification code below to proceed:</p>
        
        <div style="background-color: #fff7ed; padding: 25px; text-align: center; border-radius: 12px; margin: 30px 0; border: 1px dashed #fdba74;">
          <span style="color: #ea580c; letter-spacing: 8px; font-size: 36px; font-weight: bold; font-family: monospace;">${otp}</span>
        </div>
        
        <p style="font-size: 14px; color: #666;">This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email or contact support if you have concerns.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
          <p>© 2026 Replateo. 123 Food Street, Global City.</p>
          <p>This is an automated security message. Please do not reply.</p>
        </div>
      </div>
    `,
  };

  try {
    console.log(`📡 Attempting to send Reset OTP from: ${process.env.EMAIL_USER}`);
    await transporter.sendMail(mailOptions);

    otpStore.set(normalizedEmail, {
      otp: otp.toString(),
      expires: Date.now() + 10 * 60 * 1000,
    });

    console.log(`📨 Reset OTP sent successfully to ${normalizedEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Reset Email failed:`, error);
    throw new Error(`OTP_EMAIL_FAILED: ${error.message}`);
  }
};
