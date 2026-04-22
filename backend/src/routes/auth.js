import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { newOtpCode, newToken, sha256Hex } from "../lib/security.js";
import { sendEmail } from "../lib/email.js";
import { AdminLoginOtp } from "../models/AdminLoginOtp.js";
import { EmailVerificationOtp } from "../models/EmailVerificationOtp.js";
import { PasswordResetOtp } from "../models/PasswordResetOtp.js";

export const authRouter = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  gender: z.enum(["male", "female", "other", "prefer_not_say"]).optional(),
  birthDate: z.string().datetime().optional()
});

const loginSchema = z.object({
  // accept either `email` (legacy) or `identifier` (email or username)
  email: z.string().email().optional(),
  identifier: z.string().min(1).optional(),
  password: z.string().min(1),
  otp: z.string().min(4).max(10).optional()
});

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
      username: user.username ?? null,
      permissions: user.permissions ?? []
    },
    env.jwtSecret,
    {
    expiresIn: env.jwtExpiresIn
    }
  );
}

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const email = parsed.data.email.toLowerCase();
  const username = parsed.data.username.toLowerCase();

  const existingEmail = await User.findOne({ email });
  if (existingEmail) return res.status(409).json({ error: "Email already in use" });
  const existingUsername = await User.findOne({ username });
  if (existingUsername) return res.status(409).json({ error: "Username already in use" });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const rawVerifyToken = newToken(32);
  const verifyTokenHash = sha256Hex(rawVerifyToken);
  const verifyExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  let user;
  try {
    user = await User.create({
      email,
      ...(username ? { username } : {}),
      passwordHash,
      role: "user",
      permissions: [],
      profile: {
        gender: parsed.data.gender ?? "prefer_not_say",
        birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null
      },
      emailVerified: true // Auto-verify email (no OTP needed)
    });
  } catch (err) {
    // Handle duplicate username (or other unique index) gracefully
    if (err && err.code === 11000 && err.keyPattern && err.keyPattern.username) {
      return res.status(409).json({ error: "Username already in use" });
    }
    throw err;
  }

  if (env.bootstrapAdminEmail && env.bootstrapAdminEmail.toLowerCase() === email) {
    user.role = "admin";
    user.permissions = ["*"];
    await user.save();
  }

  return res.status(201).json({
    user: { id: String(user._id), email: user.email, username: user.username ?? null, role: user.role, emailVerified: user.emailVerified },
    message: "Registration successful. You can now login."
  });
});

// Verify email via OTP (challengeId + code)
authRouter.post("/verify-email-otp", async (req, res) => {
  const challengeId = String(req.body?.challengeId ?? "");
  const code = String(req.body?.code ?? "");
  if (!challengeId || !code) return res.status(400).json({ error: "Invalid input" });

  const rec = await EmailVerificationOtp.findById(challengeId);
  if (!rec || rec.consumedAt) return res.status(400).json({ error: "Invalid or expired code" });
  if (rec.expiresAt.getTime() < Date.now()) return res.status(400).json({ error: "Invalid or expired code" });
  if (rec.attemptsLeft <= 0) return res.status(400).json({ error: "Too many attempts" });

  const codeHash = sha256Hex(code);
  if (codeHash !== rec.codeHash) {
    rec.attemptsLeft -= 1;
    await rec.save();
    return res.status(401).json({ error: "Invalid code" });
  }

  rec.consumedAt = new Date();
  await rec.save();

  const user = await User.findById(rec.userId);
  if (!user) return res.status(400).json({ error: "Invalid code" });

  user.emailVerified = true;
  await user.save();
  return res.json({ ok: true });
});

authRouter.post("/login", async (req, res) => {
  const body = req.body || {};
  const identifier = String(body.identifier ?? body.email ?? "").trim();
  const password = String(body.password ?? "");
  const otp = body.otp;
  if (!identifier || !password) return res.status(400).json({ error: "Invalid input" });

  const idLower = identifier.toLowerCase();
  let user;
  if (idLower.includes("@")) {
    user = await User.findOne({ email: idLower });
  } else {
    user = await User.findOne({ username: idLower });
  }
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  if (user.role === "admin") {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: String(user._id),
      email: user.email,
      username: user.username ?? null,
      role: user.role,
      emailVerified: user.emailVerified,
      twoFactorEnabled: Boolean(user.twoFactor?.enabled)
    }
  });
});

// Separate admin login (2-step): email+password -> sends OTP via SMTP
authRouter.post("/admin/login/start", async (req, res) => {
  const parsed = z
    .object({
      email: z.string().email(),
      password: z.string().min(1)
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const email = parsed.data.email.toLowerCase();
  const user = await User.findOne({ email });
  if (!user || user.role !== "admin") return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  // For security, require SMTP to be configured for admin OTP
  const code = newOtpCode();
  const codeHash = sha256Hex(code);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
  const rec = await AdminLoginOtp.create({ userId: user._id, codeHash, expiresAt, attemptsLeft: 5 });

  const sent = await sendEmail({
    to: user.email,
    subject: "Admin login verification code",
    html: `<p>Your admin login code is:</p><h2 style="letter-spacing:2px">${code}</h2><p>This code expires in 10 minutes.</p>`
  });
  if (sent.skipped && env.nodeEnv !== "development") return res.status(500).json({ error: "SMTP not configured. Admin login requires email OTP." });
  // In development, allow admin login start to proceed even if SMTP is not configured.
  if (sent.skipped && env.nodeEnv === "development") {
    console.warn(`SMTP not configured; development shortcut: admin code for ${user.email} is ${code}`);
  }

  return res.json({ challengeId: String(rec._id) });
});

authRouter.post("/admin/login/verify", async (req, res) => {
  const parsed = z
    .object({
      challengeId: z.string().min(1),
      code: z.string().min(4).max(10)
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const rec = await AdminLoginOtp.findById(parsed.data.challengeId);
  if (!rec || rec.consumedAt) return res.status(400).json({ error: "Invalid or expired code" });
  if (rec.expiresAt.getTime() < Date.now()) return res.status(400).json({ error: "Invalid or expired code" });
  if (rec.attemptsLeft <= 0) return res.status(400).json({ error: "Too many attempts" });

  const codeHash = sha256Hex(parsed.data.code);
  if (codeHash !== rec.codeHash) {
    rec.attemptsLeft -= 1;
    await rec.save();
    return res.status(401).json({ error: "Invalid code" });
  }

  rec.consumedAt = new Date();
  await rec.save();

  const user = await User.findById(rec.userId);
  if (!user || user.role !== "admin") return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: String(user._id),
      email: user.email,
      username: user.username ?? null,
      role: user.role,
      emailVerified: user.emailVerified,
      twoFactorEnabled: Boolean(user.twoFactor?.enabled)
    }
  });
});

authRouter.post("/verify-email", async (req, res) => {
  const email = String(req.body?.email ?? "").toLowerCase();
  const token = String(req.body?.token ?? "");
  if (!email || !token) return res.status(400).json({ error: "Invalid input" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid token" });
  if (user.emailVerified) return res.json({ ok: true });

  const tokenHash = sha256Hex(token);
  const expiresAt = user.emailVerification?.expiresAt;
  if (!user.emailVerification?.tokenHash || user.emailVerification.tokenHash !== tokenHash) {
    return res.status(400).json({ error: "Invalid token" });
  }
  if (!expiresAt || expiresAt.getTime() < Date.now()) {
    return res.status(400).json({ error: "Token expired" });
  }

  user.emailVerified = true;
  user.emailVerification = { tokenHash: null, expiresAt: null };
  await user.save();
  return res.json({ ok: true });
});

authRouter.post("/resend-verification", async (req, res) => {
  const email = String(req.body?.email ?? "").toLowerCase();
  if (!email) return res.status(400).json({ error: "Invalid input" });

  const user = await User.findOne({ email });
  if (!user) return res.json({ ok: true });
  if (user.emailVerified) return res.json({ ok: true });

  const rawVerifyToken = newToken(32);
  user.emailVerification = { tokenHash: sha256Hex(rawVerifyToken), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) };
  await user.save();

  const verifyUrl = `${env.frontendOrigin}/login?verify=1&email=${encodeURIComponent(email)}&token=${rawVerifyToken}`;
  await sendEmail({
    to: email,
    subject: "Confirm your registration",
    html: `<p>Confirm your email:</p><p><a href="${verifyUrl}">Confirm Email</a></p>`
  });

  return res.json({ ok: true });
});

// Admin 2FA setup (TOTP)
authRouter.post("/admin/2fa/setup", requireAuth, async (req, res) => {
  const me = await User.findById(req.user.sub);
  if (!me) return res.status(404).json({ error: "Not found" });
  if (me.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  const secret = speakeasy.generateSecret({ name: `Marathon Manager (${me.email})` });
  me.twoFactor = { enabled: false, secretBase32: secret.base32 };
  await me.save();

  const otpauthUrl = secret.otpauth_url;
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl);
  return res.json({ otpauthUrl, qrDataUrl });
});

authRouter.post("/admin/2fa/enable", requireAuth, async (req, res) => {
  const otp = String(req.body?.otp ?? "");
  const me = await User.findById(req.user.sub);
  if (!me) return res.status(404).json({ error: "Not found" });
  if (me.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  const secret = me.twoFactor?.secretBase32;
  if (!secret) return res.status(400).json({ error: "Setup required" });
  const okTotp = speakeasy.totp.verify({ secret, encoding: "base32", token: otp, window: 1 });
  if (!okTotp) return res.status(400).json({ error: "Invalid OTP" });
  me.twoFactor.enabled = true;
  await me.save();
  return res.json({ ok: true });
});

authRouter.post("/change-password", requireAuth, async (req, res) => {
  const parsed = z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8)
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ error: "Not found" });

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Current password is incorrect" });

  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Your password has been changed",
    html: `<p>Your password was successfully changed. If you did not make this change, contact support.</p>`
  });

  return res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub).select("email username role permissions emailVerified twoFactor profile").lean();
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json({
    user: {
      id: String(user._id),
      email: user.email,
      username: user.username ?? null,
      role: user.role,
      permissions: user.permissions ?? [],
      emailVerified: Boolean(user.emailVerified),
      twoFactorEnabled: Boolean(user.twoFactor?.enabled),
      profile: user.profile ?? {}
    }
  });
});

// Forgot password: start (send OTP)
authRouter.post("/forgot-password/start", async (req, res) => {
  const email = String(req.body?.email ?? "").toLowerCase();
  if (!email) return res.status(400).json({ error: "Invalid input" });

  const user = await User.findOne({ email });
  // Do not reveal whether the email exists
  if (!user) return res.json({ ok: true });

  const code = newOtpCode();
  const codeHash = sha256Hex(code);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
  const rec = await PasswordResetOtp.create({ userId: user._id, codeHash, expiresAt, attemptsLeft: 5 });

  const sent = await sendEmail({
    to: email,
    subject: "Password reset code",
    html: `<p>Your password reset code is:</p><h2 style="letter-spacing:2px">${code}</h2><p>This code expires in 15 minutes.</p>`
  });
  if (sent.skipped && env.nodeEnv !== "development") return res.status(500).json({ error: "SMTP not configured. Password reset requires email delivery." });
  if (sent.skipped && env.nodeEnv === "development") {
    console.warn(`SMTP not configured; development shortcut: password reset code for ${user.email} is ${code}`);
  }

  return res.json({ challengeId: String(rec._id) });
});

// Forgot password: verify & reset password
authRouter.post("/forgot-password/verify", async (req, res) => {
  const challengeId = String(req.body?.challengeId ?? "");
  const code = String(req.body?.code ?? "");
  const newPassword = String(req.body?.newPassword ?? "");
  if (!challengeId || !code || !newPassword || newPassword.length < 8) return res.status(400).json({ error: "Invalid input" });

  const rec = await PasswordResetOtp.findById(challengeId);
  if (!rec || rec.consumedAt) return res.status(400).json({ error: "Invalid or expired code" });
  if (rec.expiresAt.getTime() < Date.now()) return res.status(400).json({ error: "Invalid or expired code" });
  if (rec.attemptsLeft <= 0) return res.status(400).json({ error: "Too many attempts" });

  const codeHash = sha256Hex(code);
  if (codeHash !== rec.codeHash) {
    rec.attemptsLeft -= 1;
    await rec.save();
    return res.status(401).json({ error: "Invalid code" });
  }

  rec.consumedAt = new Date();
  await rec.save();

  const user = await User.findById(rec.userId);
  if (!user) return res.status(400).json({ error: "Invalid code" });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Your password has been changed",
    html: `<p>Your password was successfully changed. If you did not request this, contact support.</p>`
  });

  return res.json({ ok: true });
});
