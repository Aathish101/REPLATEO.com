import axios from "axios";
import crypto from "crypto";

/* =======================
   OTP STORE (TEMP MEMORY)
======================= */
const otpStore = new Map();

/* =======================
   GENERATE OTP
======================= */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/* =======================
   SEND OTP EMAIL (EmailJS)
======================= */
export const sendOTPEmail = async (email) => {
  const normalizedEmail = email.toLowerCase();
  const otp = generateOTP();

  try {
    console.log(`📡 Sending OTP via EmailJS to ${normalizedEmail}`);

    await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: "service_rg5bxkl",
      template_id: "template_r3o43qd",
      public_key: "PajnyyFUlfT4OCAAF",
      template_params: {
        to_email: normalizedEmail,
        otp: otp,
        time: "15 minutes",
      },
    });

    otpStore.set(normalizedEmail, {
      otp,
      expires: Date.now() + 15 * 60 * 1000,
    });

    console.log("✅ OTP sent successfully via EmailJS");
    return true;

  } catch (error) {
    console.error("❌ EmailJS OTP Error:", error.response?.data || error.message);
    return false;
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