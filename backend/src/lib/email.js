import nodemailer from "nodemailer";
import { env } from "../config/env.js";

function canSend() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

let cachedTransport = null;
function getTransport() {
  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass }
    });
  }
  return cachedTransport;
}

export async function sendEmail({ to, subject, html }) {
  if (!canSend()) {
    console.warn("SMTP not configured; skipping email send.");
    // Extract OTP code from HTML for debugging
    const otpMatch = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
    if (otpMatch) {
      console.log("=".repeat(60));
      console.log(`📧 OTP CODE for ${to}: ${otpMatch[1]}`);
      console.log("=".repeat(60));
    }
    return { skipped: true };
  }
  try {
    const transport = getTransport();
    await transport.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to}`);
    return { skipped: false };
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    // Fallback: log OTP code even if email fails
    const otpMatch = html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
    if (otpMatch) {
      console.log("=".repeat(60));
      console.log(`📧 OTP CODE for ${to}: ${otpMatch[1]}`);
      console.log("⚠️  Email failed but you can use this code manually");
      console.log("=".repeat(60));
    }
    throw error;
  }
}

