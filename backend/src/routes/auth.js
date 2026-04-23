import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Admin } from "../models/Admin.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  gender: z.enum(["male", "female", "other", "prefer_not_say"]).optional(),
  birthDate: z.string().datetime().optional()
});

const loginSchema = z.object({
  email: z.string().email().optional(),
  identifier: z.string().min(1).optional(),
  password: z.string().min(1)
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

  let user;
  try {
    user = await User.create({
      email,
      ...(username ? { username } : {}),
      passwordHash,
      role: "user",
      profile: {
        gender: parsed.data.gender ?? "prefer_not_say",
        birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null
      }
    });
  } catch (err) {
    if (err && err.code === 11000 && err.keyPattern && err.keyPattern.username) {
      return res.status(409).json({ error: "Username already in use" });
    }
    throw err;
  }

  return res.status(201).json({
    user: { id: String(user._id), email: user.email, username: user.username ?? null, role: user.role },
    message: "Registration successful. You can now login."
  });
});

authRouter.post("/login", async (req, res) => {
  const body = req.body || {};
  const identifier = String(body.identifier ?? body.email ?? "").trim();
  const password = String(body.password ?? "");
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

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: String(user._id),
      email: user.email,
      username: user.username ?? null,
      role: user.role
    }
  });
});

authRouter.post("/admin/login", async (req, res) => {
  const parsed = z
    .object({
      email: z.string().email(),
      password: z.string().min(1)
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const email = parsed.data.email.toLowerCase();
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(admin);
  return res.json({
    token,
    user: {
      id: String(admin._id),
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    }
  });
});

authRouter.post("/change-password", requireAuth, async (req, res) => {
  const parsed = z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8)
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  let account;
  if (req.user.role === "admin") {
    account = await Admin.findById(req.user.sub);
  } else {
    account = await User.findById(req.user.sub);
  }

  if (!account) return res.status(404).json({ error: "Not found" });

  const ok = await bcrypt.compare(parsed.data.currentPassword, account.passwordHash);
  if (!ok) return res.status(401).json({ error: "Current password is incorrect" });

  account.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await account.save();

  return res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  if (req.user.role === "admin") {
    const admin = await Admin.findById(req.user.sub).select("email role permissions").lean();
    if (!admin) return res.status(404).json({ error: "Not found" });
    return res.json({
      user: {
        id: String(admin._id),
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions ?? []
      }
    });
  } else {
    const user = await User.findById(req.user.sub).select("email username role profile").lean();
    if (!user) return res.status(404).json({ error: "Not found" });
    return res.json({
      user: {
        id: String(user._id),
        email: user.email,
        username: user.username ?? null,
        role: user.role,
        profile: user.profile ?? {}
      }
    });
  }
});
