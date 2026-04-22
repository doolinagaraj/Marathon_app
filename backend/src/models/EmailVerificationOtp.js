import mongoose from "mongoose";

const EmailVerificationOtpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attemptsLeft: { type: Number, default: 5 },
    consumedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

EmailVerificationOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerificationOtp = mongoose.model("EmailVerificationOtp", EmailVerificationOtpSchema);
