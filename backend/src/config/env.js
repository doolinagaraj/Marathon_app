import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  bootstrapAdminEmail: process.env.BOOTSTRAP_ADMIN_EMAIL ?? "",
  // Optional seed admin user (created/updated on boot if set)
  adminSeed: {
    email: process.env.ADMIN_SEED_EMAIL ?? "",
    password: process.env.ADMIN_SEED_PASSWORD ?? ""
  },
  // Push notifications (Web Push)
  vapid: {
    subject: process.env.VAPID_SUBJECT ?? "mailto:no-reply@example.com",
    publicKey: process.env.VAPID_PUBLIC_KEY ?? "",
    privateKey: process.env.VAPID_PRIVATE_KEY ?? ""
  },
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "Marathon App <no-reply@example.com>"
  }
};

