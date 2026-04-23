import { createApp } from "./app.js";
import { connectDb } from "./lib/db.js";
import { env } from "./config/env.js";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Admin } from "./models/Admin.js";

await connectDb();

// Optional: seed an admin user (email+password) on boot
if (env.adminSeed.email && env.adminSeed.password) {
  const email = env.adminSeed.email.toLowerCase();
  const existing = await Admin.findOne({ email });
  const passwordHash = await bcrypt.hash(env.adminSeed.password, 10);
  if (!existing) {
    await Admin.create({
      email,
      passwordHash,
      role: "admin",
      permissions: ["*"]
    });
    console.log("Seeded admin user:", email);
  } else {
    existing.passwordHash = passwordHash;
    existing.permissions = ["*"];
    await existing.save();
    console.log("Updated/Reset admin user credentials:", email);
  }
}

const app = createApp();

app.listen(env.port, () => {
  console.log(`Backend listening on :${env.port}`);
});

