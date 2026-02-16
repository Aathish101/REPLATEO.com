import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing Email Configuration...");
console.log(`User: ${process.env.EMAIL_USER}`);
// Mask password for safety
console.log(`Pass: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/./g, '*') : "NOT SET"}`);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function test() {
    try {
        const info = await transporter.verify();
        console.log("✅ Server is ready to take our messages");

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: "Test Email",
            text: "This is a test email.",
        });
        console.log("✅ Test email sent successfully");
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

test();
