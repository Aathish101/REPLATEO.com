import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    console.log(`📡 Sending OTP via Resend to ${normalizedEmail}`);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: normalizedEmail,
      subject: "Your Replateo Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #f97316; text-align: center;">Replateo Verification</h2>
          <p>Hello,</p>
          <p>Use the OTP below to verify your email:</p>
          <div style="background-color: #fff7ed; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #f97316; letter-spacing: 6px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <hr />
          <p style="font-size: 12px; color: #888; text-align: center;">
            © 2026 Replateo. All rights reserved.
          </p>
        </div>
      `,
    });

    otpStore.set(normalizedEmail, {
      otp: otp.toString(),
      expires: Date.now() + 10 * 60 * 1000,
    });

    console.log("✅ OTP sent successfully via Resend");
    return true;

  } catch (error) {
    console.error("❌ Resend OTP Error:", error);
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
   SEND RESET OTP EMAIL
======================= */
export const sendResetOTPEmail = async (email, otp) => {
  const normalizedEmail = email.toLowerCase();

  try {
    console.log(`📡 Sending Reset OTP via Resend to ${normalizedEmail}`);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: normalizedEmail,
      subject: "Reset your Replateo password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #ea580c;">Password Reset</h2>
          <p>Use the verification code below to reset your password:</p>
          <div style="background-color: #fff7ed; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #ea580c; letter-spacing: 6px;">${otp}</h1>
          </div>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });

    otpStore.set(normalizedEmail, {
      otp: otp.toString(),
      expires: Date.now() + 10 * 60 * 1000,
    });

    console.log("✅ Reset OTP sent successfully via Resend");
    return true;

  } catch (error) {
    console.error("❌ Resend Reset OTP Error:", error);
    throw new Error("OTP_EMAIL_FAILED");
  }
};