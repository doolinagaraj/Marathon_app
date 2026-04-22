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
    return { skipped: true };
  }
  const transport = getTransport();
  await transport.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html
  });
  return { skipped: false };
}

