import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    username: { type: String, required: false, unique: true, sparse: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "user" },
    profile: {
      gender: { type: String, enum: ["male", "female", "other", "prefer_not_say"], default: "prefer_not_say" },
      birthDate: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
