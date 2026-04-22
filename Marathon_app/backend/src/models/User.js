import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    // Optional display username (unique if set). Login uses email.
    username: { type: String, required: false, unique: true, sparse: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user", index: true },
    permissions: { type: [String], default: [] },

    profile: {
      gender: { type: String, enum: ["male", "female", "other", "prefer_not_say"], default: "prefer_not_say" },
      birthDate: { type: Date, default: null }
    },

    emailVerified: { type: Boolean, default: false },
    emailVerification: {
      tokenHash: { type: String, default: null },
      expiresAt: { type: Date, default: null }
    },

    twoFactor: {
      enabled: { type: Boolean, default: false },
      secretBase32: { type: String, default: null }
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);

